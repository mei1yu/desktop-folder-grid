using System;
using System.IO;
using System.Drawing;
using System.Drawing.Imaging;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Text;
using Microsoft.Win32;

public class Program {
    [DllImport("shell32.dll", EntryPoint = "#727")]
    private static extern int SHGetImageList(int iImageList, ref Guid riid, out IImageList ppv);

    [DllImport("shell32.dll", CharSet = CharSet.Auto)]
    private static extern IntPtr SHGetFileInfo(string pszPath, uint dwFileAttributes, ref SHFILEINFO psfi, uint cbFileInfo, uint uFlags);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern bool DestroyIcon(IntPtr hIcon);

    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Auto)]
    private struct SHFILEINFO {
        public IntPtr hIcon;
        public int iIcon;
        public uint dwAttributes;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 260)]
        public string szDisplayName;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 80)]
        public string szTypeName;
    }

    [ComImport, Guid("46EB5926-582E-4017-9FDF-E8998DAA0950"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    private interface IImageList {
        [PreserveSig] int Resize(int cxNewIcon, int cyNewIcon);
        [PreserveSig] int GetIcon(int i, int flags, out IntPtr picon);
    }

    private const uint SHGFI_SYSICONINDEX = 0x000004000;
    private const int SHIL_JUMBO = 4; // 256x256
    private const int SHIL_EXTRALARGE = 2; // 48x48
    private const int SHIL_LARGE = 0; // 32x32

    private static Guid IID_IImageList = new Guid("46EB5926-582E-4017-9FDF-E8998DAA0950");

    [ComImport, Guid("00021401-0000-0000-C000-000000000046")]
    private class ShellLink {}

    [ComImport, InterfaceType(ComInterfaceType.InterfaceIsIUnknown), Guid("000214F9-0000-0000-C000-000000000046")]
    private interface IShellLinkW {
        void GetPath([Out, MarshalAs(UnmanagedType.LPWStr)] StringBuilder pszFile, int cchMaxPath, IntPtr pfd, uint fFlags);
        void GetIDList(out IntPtr ppidl);
        void SetIDList(IntPtr pidl);
        void GetDescription([Out, MarshalAs(UnmanagedType.LPWStr)] StringBuilder pszName, int cchMaxName);
        void SetDescription([MarshalAs(UnmanagedType.LPWStr)] string pszName);
        void GetWorkingDirectory([Out, MarshalAs(UnmanagedType.LPWStr)] StringBuilder pszDir, int cchMaxPath);
        void SetWorkingDirectory([MarshalAs(UnmanagedType.LPWStr)] string pszDir);
        void GetArguments([Out, MarshalAs(UnmanagedType.LPWStr)] StringBuilder pszArgs, int cchMaxPath);
        void SetArguments([MarshalAs(UnmanagedType.LPWStr)] string pszArgs);
        void GetHotkey(out short pwHotkey);
        void SetHotkey(short wHotkey);
        void GetShowCmd(out int piShowCmd);
        void SetShowCmd(int iShowCmd);
        void GetIconLocation([Out, MarshalAs(UnmanagedType.LPWStr)] StringBuilder pszIconPath, int cchIconPath, out int piIcon);
        void SetIconLocation([MarshalAs(UnmanagedType.LPWStr)] string pszIconPath, int iIcon);
        void SetRelativePath([MarshalAs(UnmanagedType.LPWStr)] string pszPathRel, uint dwReserved);
        void Resolve(IntPtr hwnd, uint fFlags);
        void SetPath([MarshalAs(UnmanagedType.LPWStr)] string pszFile);
    }

    [DllImport("shell32.dll", CharSet = CharSet.Auto)]
    private static extern uint ExtractIconEx(string szFileName, int nIconIndex, IntPtr[] phiconLarge, IntPtr[] phiconSmall, uint nIcons);

    [ComImport, InterfaceType(ComInterfaceType.InterfaceIsIUnknown), Guid("0000010b-0000-0000-C000-000000000046")]
    private interface IPersistFile {
        void GetClassID(out Guid pClassID);
        void IsDirty();
        void Load([MarshalAs(UnmanagedType.LPWStr)] string pszFileName, uint dwMode);
        void Save([MarshalAs(UnmanagedType.LPWStr)] string pszFileName, [MarshalAs(UnmanagedType.Bool)] bool fRemember);
        void SaveCompleted([MarshalAs(UnmanagedType.LPWStr)] string pszFileName);
        void GetCurFile([Out, MarshalAs(UnmanagedType.LPWStr)] StringBuilder ppszFileName);
    }

    public class ShortcutInfo {
        public string Target;
        public string IconPath;
        public int IconIndex;
    }

    public static ShortcutInfo InspectShortcut(string shortcutPath) {
        ShortcutInfo info = new ShortcutInfo();
        info.Target = shortcutPath;
        info.IconPath = null;
        info.IconIndex = 0;
        try {
            IShellLinkW link = (IShellLinkW)new ShellLink();
            IPersistFile file = (IPersistFile)link;
            file.Load(shortcutPath, 0);
            StringBuilder sbPath = new StringBuilder(260);
            link.GetPath(sbPath, 260, IntPtr.Zero, 0);
            info.Target = sbPath.ToString();
            StringBuilder sbIcon = new StringBuilder(260);
            int iconIdx = 0;
            link.GetIconLocation(sbIcon, 260, out iconIdx);
            info.IconPath = sbIcon.ToString();
            info.IconIndex = iconIdx;
        } catch {}
        return info;
    }

    public static Bitmap ExtractIconFromLocation(string file, int index) {
        try {
            if (File.Exists(file)) {
                if (file.EndsWith(".ico", StringComparison.OrdinalIgnoreCase)) {
                    using (Icon ico = new Icon(file, new Size(128, 128))) {
                        return ico.ToBitmap();
                    }
                }
                IntPtr[] large = new IntPtr[1];
                uint count = ExtractIconEx(file, index, large, null, 1);
                if (count > 0 && large[0] != IntPtr.Zero) {
                    Bitmap bmp = (Bitmap)Bitmap.FromHicon(large[0]).Clone();
                    DestroyIcon(large[0]);
                    return bmp;
                }
            }
        } catch {}
        return null;
    }

    public static Bitmap GetJumboIcon(string path) {
        SHFILEINFO shfi = new SHFILEINFO();
        IntPtr hImgList = SHGetFileInfo(path, 0, ref shfi, (uint)Marshal.SizeOf(shfi), SHGFI_SYSICONINDEX);
        if (hImgList != IntPtr.Zero) {
            int iconIndex = shfi.iIcon;
            IImageList spiml = null;
            // Try Jumbo first (256x256)
            int hres = SHGetImageList(SHIL_JUMBO, ref IID_IImageList, out spiml);
            if (hres == 0 && spiml != null) {
                IntPtr hIcon = IntPtr.Zero;
                spiml.GetIcon(iconIndex, 1 /* ILD_TRANSPARENT */, out hIcon);
                if (hIcon != IntPtr.Zero) {
                    try {
                        Bitmap bmp = (Bitmap)Bitmap.FromHicon(hIcon).Clone();
                        DestroyIcon(hIcon);
                        if (bmp != null && bmp.Width >= 32) return bmp;
                    } catch {
                        DestroyIcon(hIcon);
                    }
                }
            }

            // Fallback to Extra Large (48x48)
            hres = SHGetImageList(SHIL_EXTRALARGE, ref IID_IImageList, out spiml);
            if (hres == 0 && spiml != null) {
                IntPtr hIcon = IntPtr.Zero;
                spiml.GetIcon(iconIndex, 1, out hIcon);
                if (hIcon != IntPtr.Zero) {
                    try {
                        Bitmap bmp = (Bitmap)Bitmap.FromHicon(hIcon).Clone();
                        DestroyIcon(hIcon);
                        if (bmp != null) return bmp;
                    } catch {
                        DestroyIcon(hIcon);
                    }
                }
            }
        }

        if (Directory.Exists(path)) {
            SHFILEINFO dirShfi = new SHFILEINFO();
            SHGetFileInfo(path, 0, ref dirShfi, (uint)Marshal.SizeOf(dirShfi), 0x000000100 /* SHGFI_ICON */ | 0x000000000 /* SHGFI_LARGEICON */);
            if (dirShfi.hIcon != IntPtr.Zero) {
                try {
                    Bitmap bmp = (Bitmap)Bitmap.FromHicon(dirShfi.hIcon).Clone();
                    DestroyIcon(dirShfi.hIcon);
                    return bmp;
                } catch {
                    DestroyIcon(dirShfi.hIcon);
                }
            }
        }

        // Fallback to ExtractAssociatedIcon
        try {
            using (Icon ico = Icon.ExtractAssociatedIcon(path)) {
                if (ico != null) return ico.ToBitmap();
            }
        } catch {}

        return null;
    }

    public static void OutputWallpaperColor() {
        try {
            string wpPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), @"Microsoft\Windows\Themes\TranscodedWallpaper");
            if (!File.Exists(wpPath)) {
                try {
                    using (RegistryKey key = Registry.CurrentUser.OpenSubKey(@"Control Panel\Desktop")) {
                        if (key != null) wpPath = key.GetValue("WallPaper") as string;
                    }
                } catch {}
            }

            if (!File.Exists(wpPath)) {
                Console.WriteLine("{\"success\":false}");
                return;
            }

            using (Bitmap original = new Bitmap(wpPath)) {
                using (Bitmap thumb = new Bitmap(original, new Size(120, 80))) {
                    Dictionary<int, float> colorScores = new Dictionary<int, float>();

                    for (int x = 0; x < thumb.Width; x++) {
                        for (int y = 0; y < thumb.Height; y++) {
                            Color c = thumb.GetPixel(x, y);
                            float sat = c.GetSaturation();
                            float bri = c.GetBrightness();

                            if (sat < 0.20f || bri < 0.30f || bri > 0.92f) continue;

                            int rBin = c.R / 20;
                            int gBin = c.G / 20;
                            int bBin = c.B / 20;
                            int key = (rBin << 16) | (gBin << 8) | bBin;

                            float weight = (sat * sat) * (1.0f - Math.Abs(bri - 0.65f));
                            if (colorScores.ContainsKey(key)) colorScores[key] += weight;
                            else colorScores[key] = weight;
                        }
                    }

                    int domR = 244, domG = 114, domB = 182; // Fallback pink
                    float maxScore = -1f;
                    foreach (var pair in colorScores) {
                        if (pair.Value > maxScore) {
                            maxScore = pair.Value;
                            int k = pair.Key;
                            domR = Math.Min(255, ((k >> 16) & 0xFF) * 20 + 10);
                            domG = Math.Min(255, ((k >> 8) & 0xFF) * 20 + 10);
                            domB = Math.Min(255, (k & 0xFF) * 20 + 10);
                        }
                    }

                    // Pastel frosted glass background (22% dominant + 78% white)
                    int bgR = Math.Min(255, (int)(domR * 0.22 + 255 * 0.78));
                    int bgG = Math.Min(255, (int)(domG * 0.22 + 255 * 0.78));
                    int bgB = Math.Min(255, (int)(domG * 0.22 + 255 * 0.78));

                    // Card background (15% dominant + 85% white)
                    int cardR = Math.Min(255, (int)(domR * 0.15 + 255 * 0.85));
                    int cardG = Math.Min(255, (int)(domG * 0.15 + 255 * 0.85));
                    int cardB = Math.Min(255, (int)(domG * 0.15 + 255 * 0.85));

                    // Modal background (20% dominant + 80% white)
                    int modalR = Math.Min(255, (int)(domR * 0.20 + 255 * 0.80));
                    int modalG = Math.Min(255, (int)(domG * 0.20 + 255 * 0.80));
                    int modalB = Math.Min(255, (int)(domG * 0.20 + 255 * 0.80));

                    string domHex = string.Format("#{0:X2}{1:X2}{2:X2}", domR, domG, domB);
                    string bgTint = string.Format("rgba({0}, {1}, {2}, 0.50)", bgR, bgG, bgB);
                    string cardTint = string.Format("rgba({0}, {1}, {2}, 0.42)", cardR, cardG, cardB);
                    string modalTint = string.Format("rgba({0}, {1}, {2}, 0.85)", modalR, modalG, modalB);
                    string borderHighlight = string.Format("rgba({0}, {1}, {2}, 0.55)", domR, domG, domB);
                    string zipperBg = string.Format("rgba({0}, {1}, {2}, 0.52)", bgR, bgG, bgB);

                    Console.WriteLine("{\"success\":true,\"dominantHex\":\"" + domHex + "\",\"accentHex\":\"" + domHex + "\",\"bgTint\":\"" + bgTint + "\",\"cardTint\":\"" + cardTint + "\",\"modalTint\":\"" + modalTint + "\",\"borderHighlight\":\"" + borderHighlight + "\",\"zipperBg\":\"" + zipperBg + "\"}");
                }
            }
        } catch (Exception ex) {
            Console.WriteLine("{\"success\":false,\"error\":\"" + ex.Message.Replace("\"", "\\\"") + "\"}");
        }
    }

    [STAThread]
    public static void Main(string[] args) {
        try {
            if (args.Length == 0) return;
            if (args[0] == "--wallpaper") {
                OutputWallpaperColor();
                return;
            }

            string path = args[0];
            Bitmap bmp = null;

            if (path.EndsWith(".lnk", StringComparison.OrdinalIgnoreCase)) {
                ShortcutInfo info = InspectShortcut(path);

                // 1. If shortcut has custom icon specified, extract it
                if (!string.IsNullOrEmpty(info.IconPath)) {
                    string expIcon = Environment.ExpandEnvironmentVariables(info.IconPath);
                    bmp = ExtractIconFromLocation(expIcon, info.IconIndex);
                }

                // 2. Try Shell icon directly on the .lnk file
                if (bmp == null) {
                    bmp = GetJumboIcon(path);
                }

                // 3. Fallback to target executable if available
                if (bmp == null && !string.IsNullOrEmpty(info.Target) && (File.Exists(info.Target) || Directory.Exists(info.Target))) {
                    bmp = GetJumboIcon(info.Target);
                }
            } else {
                bmp = GetJumboIcon(path);
            }

            if (bmp != null) {
                using (MemoryStream ms = new MemoryStream()) {
                    bmp.Save(ms, ImageFormat.Png);
                    byte[] bytes = ms.ToArray();
                    Console.WriteLine("data:image/png;base64," + Convert.ToBase64String(bytes));
                }
            }
        } catch (Exception ex) {
            Console.Error.WriteLine("ERROR: " + ex.ToString());
        }
    }
}

