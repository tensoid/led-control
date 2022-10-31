using CommandLine;
using Newtonsoft.Json;
using SoundAnalyzer.Utils;
using System;
using System.Text;
using System.Threading;
using System.Windows.Forms;
using System.Linq;
using System.Collections.Generic;
using Un4seen.BassWasapi;


namespace SoundAnalyzer
{
    internal class Program
    {
        private static TWebSocket socket;
        private static BassGeneric.Watcher watcher;

        private static int pollingInterval = 25;

        private static void Main(string[] args)
        {
            //initialize BassApi
            BassGeneric.Install();
            BassGeneric.InitBass();

            // Show notifyicon
            NotifyIconWrapper.createNotifyIcon();
            NotifyIconWrapper.OnResetWatcher += () => { Console.WriteLine("reset"); SetupWatcher(); };

            //TODO: add TWebSockets on close event
            Parser.Default.ParseArguments<Flags>(args)
                .WithParsed<Flags>(o =>
                {
                    SetupConnection(o);
                    SetupWatcher();
                });

            System.Diagnostics.Process.GetCurrentProcess().WaitForExit();
        }

        private static void SetupConnection(Flags o)
        {
            // configure socket
            socket = new TWebSocket("ws://" + o.Server + "/client", true);
            Console.WriteLine("ws://" + o.Server);
            socket.OnDataRecieved += handleSocketData;
            socket.OnConnection += (object sender) =>
            {
                //authenticate as "master-desktop"
                var auth = new Json.Auth()
                {
                    id = "master-desktop",
                };
                socket.Send(JsonConvert.SerializeObject(auth));
            };

            //connect
            Console.WriteLine(socket.Connect());
        }

        private static void SetupWatcher()
        {
            BassWasapi.BASS_WASAPI_Free();

            watcher = new BassGeneric.Watcher(-1, pollingInterval);
            watcher.DataVol += (float data, float bassData) =>
            {
                if (!socket.Connected) return;

                var json = new Json.Data()
                {
                    id = "master-desktop",
                    type = "data",
                    data = data,
                    bassData = bassData
                };
                socket.Send(JsonConvert.SerializeObject(json));
            };

            watcher.Start();
        }

        private static void handleSocketData(object sender, byte[] buffer, int bytes)
        {
            Console.WriteLine(Encoding.UTF8.GetString(buffer, 0, bytes));
        }  
    }
}