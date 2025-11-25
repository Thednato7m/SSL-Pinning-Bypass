/* Universal Android SSL Pinning Bypass
   Targets: OkHttp, TrustManager, Android Network Security Config
*/

Java.perform(function() {
    console.log("[*] Starting Universal SSL Pinning Bypass...");

    var array_list = Java.use("java.util.ArrayList");
    var ApiClient = Java.use('com.android.org.conscrypt.TrustManagerImpl');

    // Hook TrustManagerImpl.checkTrustedRecursive to always return an empty list (Success)
    ApiClient.checkTrustedRecursive.implementation = function(a1, a2, a3, a4, a5, a6) {
        console.log("[+] Bypassing TrustManagerImpl (Android > 7)");
        return array_list.$new();
    }

    // Hook OkHttp CertificatePinner (Common in modern apps)
    try {
        var CertificatePinner = Java.use("okhttp3.CertificatePinner");
        CertificatePinner.check.overload('java.lang.String', 'java.util.List').implementation = function(str, list) {
            console.log("[+] Bypassing OkHttp 3.x: " + str);
            return;
        };
    } catch (e) {
        console.log("[-] OkHttp 3.x not found.");
    }

    // Additional generic TrustManager bypass
    var TrustManager = Java.use('javax.net.ssl.X509TrustManager');
    var SSLContext = Java.use('javax.net.ssl.SSLContext');

    // Create a custom TrustManager that trusts everything
    var TrustAll = Java.registerClass({
        name: 'com.example.TrustAll',
        implements: [TrustManager],
        methods: {
            checkClientTrusted: function(chain, authType) {},
            checkServerTrusted: function(chain, authType) {},
            getAcceptedIssuers: function() { return []; }
        }
    });

    // Inject the TrustAll manager into SSLContext
    var sc = SSLContext.getInstance("TLS");
    sc.init(null, [TrustAll.$new()], null);
    console.log("[+] Injected Trust-All SSLContext");
});