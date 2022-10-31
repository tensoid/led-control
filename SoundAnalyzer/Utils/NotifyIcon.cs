using System;
using System.Threading;
using System.Windows.Forms;

namespace SoundAnalyzer.Utils
{
    class NotifyIconWrapper
    {
        public delegate void OnResetWatcherEvent();
        public static event OnResetWatcherEvent OnResetWatcher;

        public static void createNotifyIcon()
        {
            Thread iconThread = new Thread(delegate()
            {
                // Create menu items
                MenuItem exit = new MenuItem("Exit");
                exit.Click += (object sender, EventArgs args) => { Environment.Exit(0); };

                MenuItem resetWatcher = new MenuItem("Reset Watcher");
                resetWatcher.Click += (object sender, EventArgs args) => InvokeOnResetWatcherEvent();

                MenuItem div = new MenuItem("-");

                // new icon instance
                NotifyIcon Icon = new NotifyIcon();
                Icon = new NotifyIcon()
                {
                    Icon = System.Drawing.Icon.ExtractAssociatedIcon(Application.ExecutablePath),
                    Visible = true,
                    Text = "Wayve"
                };

                // create context menu
                var menu = new ContextMenu();
                menu.MenuItems.AddRange(new MenuItem[] { resetWatcher, div, exit });
                Icon.ContextMenu = menu;

                // show icon
                Application.Run();
            });

            iconThread.SetApartmentState(ApartmentState.STA);
            iconThread.Start();
        }

        private static void InvokeOnResetWatcherEvent()
        {
            Console.WriteLine("Invoked");
            OnResetWatcher?.Invoke();
        }
    }
}
