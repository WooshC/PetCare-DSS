using System.Security.Cryptography;
using System.Text;

namespace PetCare.Payment.Services
{
    public class EncryptionService
    {
        private readonly string _key;

        public EncryptionService(IConfiguration config)
        {
            _key = config["Security:EncryptionKey"] ?? "YourSuperSecretKey1234567890123456"; // Must be 32 chars for AES-256
        }

        public string Encrypt(string plainText)
        {
            using var aes = Aes.Create();
            aes.Key = Encoding.UTF8.GetBytes(_key.Substring(0, 32));
            aes.GenerateIV();
            var iv = aes.IV;

            using var encryptor = aes.CreateEncryptor(aes.Key, iv);
            using var ms = new MemoryStream();
            // Prepend IV to the stream
            ms.Write(iv, 0, iv.Length);
            using (var cs = new CryptoStream(ms, encryptor, CryptoStreamMode.Write))
            using (var sw = new StreamWriter(cs))
            {
                sw.Write(plainText);
            }

            return Convert.ToBase64String(ms.ToArray());
        }

        public string Decrypt(string cipherText)
        {
            var fullCipher = Convert.FromBase64String(cipherText);
            
            using var aes = Aes.Create();
            aes.Key = Encoding.UTF8.GetBytes(_key.Substring(0, 32));
            
            // Extract IV (first 16 bytes)
            var iv = new byte[16];
            Array.Copy(fullCipher, 0, iv, 0, 16);
            aes.IV = iv;

            using var decryptor = aes.CreateDecryptor(aes.Key, aes.IV);
            using var ms = new MemoryStream(fullCipher, 16, fullCipher.Length - 16);
            using var cs = new CryptoStream(ms, decryptor, CryptoStreamMode.Read);
            using var sr = new StreamReader(cs);

            return sr.ReadToEnd();
        }
    }
}
