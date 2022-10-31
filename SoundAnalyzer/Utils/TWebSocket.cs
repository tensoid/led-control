using System;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;

#pragma warning disable CS1998

namespace SoundAnalyzer.Utils
{
    internal class TWebSocket
    {
        public ClientWebSocket socket;

        private CancellationTokenSource cts = new CancellationTokenSource();

        // Events
        public delegate void DataRecievedEvent(object sender, byte[] buffer, int bytes);

        public event DataRecievedEvent OnDataRecieved;

        public delegate void ConnectionEvent(object sender);

        public event ConnectionEvent OnConnection;

        private Uri uri;

        public bool Connected = false;
        private bool Reconnect;
        private int ReconnectInterval = 1000;
        private EasyTimer SocketStateCheckTimer;
        private EasyTimer ReconnectTimer;

        public enum CONN_RESULT
        {
            CONNECTION_SUCCESSFUL = 0,
            CONNECTION_REFUSED = 1,
            CONNECTION_CLOSED = 2,
            UNKNOWN = 3
        }

        public enum SEND_RESULT
        {
            SEND_SUCCESSFUL = 0,
            SEND_SOCKETINVALIDSTATE = 1
        }

        /// <summary>
        /// Instantiates a new TWebSocket Instance
        /// </summary>
        /// <param name="uri">The websocket uri to connect to</param>
        /// <param name="reconnect">Wether the socket should automatically reconnect after it loses connection (1000ms)</param>
        public TWebSocket(string uri, bool reconnect = false)
        {
            this.uri = new Uri(uri);

            // Reconnectiong logic
            this.Reconnect = reconnect;

            this.ReconnectTimer = new EasyTimer(ReconnectInterval);
            this.ReconnectTimer.Stop();
            this.ReconnectTimer.Elapsed += ReconnectSocket;

            // Socket state checks to insure the socket is still connected
            this.SocketStateCheckTimer = new EasyTimer(500);
            this.SocketStateCheckTimer.Elapsed += socketStateCheck;
        }

        /// <summary>
        /// Connects the socket
        /// </summary>
        /// <returns>CONN_RESULT</returns>
        public CONN_RESULT Connect()
        {
            CONN_RESULT result = CONN_RESULT.CONNECTION_SUCCESSFUL;

            Task.Run(async () =>
            {
                try
                {
                    socket = new ClientWebSocket();
                    await socket.ConnectAsync(uri, cts.Token);
                }
                catch (WebSocketException e)
                {
                    if (e.WebSocketErrorCode == WebSocketError.Success && this.socket.State != WebSocketState.Open) // TODO: find out correct error code
                    {
                        //OnError?.Invoke(this, (int)CONN_RESULT.CONNECTION_REFUSED
                        result = CONN_RESULT.CONNECTION_REFUSED;
                    }
                    else
                    {
                        result = CONN_RESULT.UNKNOWN;
                        ShowErrorBox(e.ToString());
                    }
                }
                catch (Exception e)
                {
                    result = CONN_RESULT.UNKNOWN;
                    ShowErrorBox(e.ToString());
                }
            }).Wait();

            //CONNECTION SUCCESSFUL
            if (result == CONN_RESULT.CONNECTION_SUCCESSFUL)
            {
                this.startDataListener();
                this.Connected = true;
                this.OnConnection?.Invoke(this);
            }
            else
            {
                if (!Reconnect) return result;

                Console.WriteLine("Starting reconnect in {0}ms", ReconnectInterval);
                this.ReconnectTimer.Start();
            }

            return result;
        }

        /// <summary>
        /// Sends a string over the socket.
        /// </summary>
        /// <param name="data">String to be sent</param>
        /// <returns></returns>
        public SEND_RESULT Send(string data)
        {
            if (!Connected) return SEND_RESULT.SEND_SOCKETINVALIDSTATE;

            Byte[] bytes = Encoding.ASCII.GetBytes(data);
            ArraySegment<byte> buffer = new ArraySegment<byte>(bytes);
            try
            {
                socket.SendAsync(buffer, WebSocketMessageType.Text, true, cts.Token);
            }
            catch (WebSocketException e)
            {
                if (e.WebSocketErrorCode == WebSocketError.ConnectionClosedPrematurely)
                {
                    return SEND_RESULT.SEND_SOCKETINVALIDSTATE;
                }
                else ShowErrorBox(e.Message);
            }
            catch (ObjectDisposedException e)
            {
                return SEND_RESULT.SEND_SOCKETINVALIDSTATE;
            }

            return SEND_RESULT.SEND_SUCCESSFUL;
        }

        /// <summary>
        /// Disconnects the socket.
        /// </summary>
        public void Disconnect()
        {
            Task.Run(async () =>
            {
                await this.socket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Disconnect", cts.Token);
            }).Wait();
        }

        /// <summary>
        /// Gets triggered by the reconnect timer and tries to connect the socket.
        /// </summary>
        /// <param name="source"></param>
        /// <param name="e"></param>
        private void ReconnectSocket(Object source, System.Timers.ElapsedEventArgs e)
        {
            this.ReconnectTimer.Stop();
            this.Connect();
        }

        /// <summary>
        /// Listens for incoming socket data.
        /// </summary>
        private void startDataListener()
        {
            Task.Factory.StartNew(async () =>
            {
                while (cts.IsCancellationRequested == false)
                {
                    Byte[] bytes = new Byte[256]; //TODO: larger files
                    ArraySegment<byte> buffer = new ArraySegment<byte>(bytes);
                    var result = socket.ReceiveAsync(buffer, cts.Token).Result;

                    OnDataRecieved?.Invoke(this, bytes, result.Count);
                }
            }, cts.Token, TaskCreationOptions.LongRunning, TaskScheduler.Default);
        }

        /// <summary>
        /// Runs continuously and checks if the socket is still open. If not it attempts a reconnect if set.
        /// </summary>
        /// <param name="source"></param>
        /// <param name="e"></param>
        private void socketStateCheck(Object source, System.Timers.ElapsedEventArgs e)
        {
            if (!this.Connected) return;

            if (this.socket.State != WebSocketState.Open && this.socket.State != WebSocketState.Connecting)
            {
                this.Connected = false;
                this.Disconnect();
                if (Reconnect) this.Connect();
            }
        }

        /// <summary>
        /// Displays an ErrorBox with the given message string.
        /// </summary>
        /// <param name="message">Error message</param>
        private void ShowErrorBox(string message)
        {
            var result = MessageBox.Show(message, "Unexpected Error!", MessageBoxButtons.RetryCancel, MessageBoxIcon.Error, MessageBoxDefaultButton.Button1);
            if (result == DialogResult.Retry) { } //TODO restart code
        }
    }
}