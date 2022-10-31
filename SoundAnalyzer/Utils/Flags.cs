﻿using CommandLine;

namespace SoundAnalyzer.Utils
{
    internal class Flags
    {
        [Option('i', "install", Default = false, HelpText = "Specifies the polling rate.")]
        public bool Install { get; set; }

        [Option('s', "server", Default = "127.0.0.1:80", HelpText = "Specifies the polling rate.")]
        public string Server { get; set; }

        [Option('n', "normalization", Default = 3, HelpText = "Specifies the amount of normalization levels.")]
        public int Normalization { get; set; }

        [Option('d', "device", Default = 0, HelpText = "Specifies which audio device to use. You must specify the appropriate device ID. Trys to get your current output device by default.")]
        public int DeviceID { get; set; }

        [Option('b', "buffer-size", Default = 256, HelpText = "Changes the buffer size. 256 is recommended.")]
        public int BufferSize { get; set; }

        [Option('m', "shift", Default = 8, HelpText = "Changes the center offset.")]
        public int Shift { get; set; }

        [Option('o', "overdraw", Default = 2.5, HelpText = "Sets the overdraw limit. If a buffer exceeds this limit, it will be ignored.")]
        public double Overdraw { get; set; }
    }
}