Frida Scripts for Thick Client SSL Pinning Bypass
A collection of Frida scripts designed to bypass SSL/TLS Certificate Pinning in thick client applications. These scripts target common validation mechanisms on Windows (Native C++/.NET) and Android (Java/Kotlin) to allow traffic interception via proxies like Burp Suite or Mitmproxy.


📂 Files Included
File,Target OS,Description
windows_bypass.js,Windows,Hooks crypt32.dll to patch CertVerifyCertificateChainPolicy. Works on most native apps and some .NET apps relying on Windows APIs.
android_bypass.js,Android,"""Universal"" bypass. Hooks OkHttp, TrustManagerImpl, and SSLContext to trust all certificates."

🛠 Prerequisites
Before running these scripts, ensure you have the following setup:

Python 3.x installed.

Frida Tools installed on your host machine:

Bash

pip install frida-tools
For Android: A rooted device/emulator with frida-server running.

For Windows: The target application running on the local machine.

🚀 Usage
1. Windows SSL Bypass (windows_bypass.js)
This script targets the Windows API CertVerifyCertificateChainPolicy within crypt32.dll. It intercepts the validation result and forces it to return TRUE (Success), enabling the interception of HTTPS traffic.


How to run:
# Option A: Attach to a running process by PID
frida -p <PID> -l windows_bypass.js

# Option B: Attach by Process Name
frida -n "TargetApp.exe" -l windows_bypass.js

What it does:

Hooks the onLeave event of the certification check.

Checks if the result is 0 (Failure).

Overwrites the return value to 1 (Success).

Clears the dwError code in the status structure to 0.

Android Universal Bypass (android_bypass.js)
This script attempts to bypass pinning using multiple vectors commonly found in Android mobile thick clients. It targets specific libraries (OkHttp) and system trust managers.

How to run:

Ensure your device is connected via ADB and frida-server is running.

Bash

# Spawn the application and inject the script immediately
frida -U -f com.example.targetapp -l android_bypass.js


What it does:

TrustManagerImpl: Hooks checkTrustedRecursive to return an empty list (trusted).

OkHttp: Hooks CertificatePinner.check() to bypass exception throwing.

SSLContext: Injects a custom X509TrustManager that blindly trusts all server certificates.

🧩 Compatibility Notes
Windows: This script works best on applications that use the OS HTTP stack (WinINet/WinHTTP). Applications using bundled libraries (like statically linked OpenSSL) may require a custom hook for SSL_CTX_set_cert_verify_callback.

Android: Effective against standard implementations. Highly obfuscated apps or those using native (NDK) networking stacks may require manual reverse engineering using Ghidra or IDA Pro to find the correct offsets

⚠️ Disclaimer
This repository is for educational purposes and authorized security testing only. Using these scripts to intercept data from applications without permission is illegal. The author is not responsible for any misuse of this code.

🤝 Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Happy Hacking! 🕵️‍♂️

