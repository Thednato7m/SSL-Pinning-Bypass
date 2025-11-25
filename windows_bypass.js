/* Windows SSL Pinning Bypass (Crypt32.dll)
   Target: Apps using standard Windows Certificate APIs (C++, some .NET)
*/

const crypt32 = Module.load("crypt32.dll");
const CertVerifyCertificateChainPolicy = crypt32.getExportByName("CertVerifyCertificateChainPolicy");

// CERT_CHAIN_POLICY_STATUS struct offset for dwError is 0x8 or 0xC depending on arch, 
// but we essentially want to zero out the error field.
const pointerSize = Process.pointerSize;

Interceptor.attach(CertVerifyCertificateChainPolicy, {
    onEnter: function(args) {
        // args[0] = pszPolicyOID
        // args[1] = pChainContext
        // args[2] = pPolicyPara
        // args[3] = pPolicyStatus (Pointer to status struct)
        this.statusPtr = args[3];
    },
    onLeave: function(retval) {
        if (retval.toInt32() === 0) { // 0 = FALSE (Failure) in this API
            console.log("[!] SSL Verification Failed. Patching to SUCCESS...");
            
            // 1. Force return value to TRUE (1)
            retval.replace(1);
            
            // 2. Clear the error code in the status struct (dwError = 0)
            if (!this.statusPtr.isNull()) {
                // The dwError is typically the second member, specifically:
                // cbSize (4 bytes) + dwError (4 bytes)
                // We write 0 to the error offset.
                this.statusPtr.add(4).writeInt(0);
            }
        }
    }
});

console.log("[*] Hooked CertVerifyCertificateChainPolicy in crypt32.dll");