# Apple Code Signing and Notarization Setup Guide

This guide will help you set up the GitHub secrets needed for signing and notarizing your macOS builds in CI/CD.

## Prerequisites

- Apple Developer Account ($99/year)
- macOS machine with Xcode installed
- Admin access to this GitHub repository

## Step 1: Get Your Apple Team ID

1. Go to https://developer.apple.com/account
2. Sign in with your Apple ID
3. Click on "Membership" in the sidebar
4. Your **Team ID** is listed there (10-character alphanumeric string)
5. **Save this value** - you'll need it for `APPLE_TEAM_ID`

## Step 2: Create/Export Developer ID Application Certificate

### If you don't have a certificate yet:

1. Open **Keychain Access** on your Mac
2. Go to **Keychain Access > Certificate Assistant > Request a Certificate from a Certificate Authority**
3. Enter your email and name, select "Saved to disk"
4. Save the Certificate Signing Request (CSR) file

5. Go to https://developer.apple.com/account/resources/certificates/list
6. Click the **+** button to create a new certificate
7. Select **Developer ID Application** (for distributing outside the Mac App Store)
8. Upload your CSR file
9. Download the certificate (.cer file)
10. Double-click to install it in Keychain Access

### Export the certificate:

1. Open **Keychain Access**
2. Select **login** keychain and **My Certificates** category
3. Find your "Developer ID Application" certificate
4. Right-click and select **Export "Developer ID Application: ..."**
5. Save as `.p12` format
6. **Set a password** when prompted (this becomes `APPLE_CERTIFICATE_PASSWORD`)
7. Save the file somewhere secure (e.g., `~/Desktop/apple-cert.p12`)

### Convert to base64:

```bash
base64 -i ~/Desktop/apple-cert.p12 | pbcopy
```

This copies the base64-encoded certificate to your clipboard. This is your `APPLE_CERTIFICATE` value.

**Important:** Delete the .p12 file from your Desktop after encoding it:
```bash
rm ~/Desktop/apple-cert.p12
```

## Step 3: Get Your Apple ID

This is simply your Apple Developer account email address. Save this as `APPLE_ID`.

## Step 4: Generate App-Specific Password

Apple requires an app-specific password for notarization (not your regular Apple ID password).

1. Go to https://appleid.apple.com
2. Sign in with your Apple ID
3. In the **Security** section, find **App-Specific Passwords**
4. Click **Generate an app-specific password**
5. Enter a label like "GitHub Actions - RapidCMI5"
6. Copy the generated password (format: `xxxx-xxxx-xxxx-xxxx`)
7. **Save this value** - you can't view it again! This is your `APPLE_ID_PASSWORD`

## Step 5: Add Secrets to GitHub

1. Go to https://github.com/ByLightSDC/rapidcmi5/settings/secrets/actions
2. Click **New repository secret** for each of these:

| Secret Name | Value | Example |
|------------|-------|---------|
| `APPLE_CERTIFICATE` | Base64-encoded .p12 certificate | `MIIKZgIBAzCCCi...` (very long) |
| `APPLE_CERTIFICATE_PASSWORD` | Password you used when exporting .p12 | `MySecurePassword123` |
| `APPLE_ID` | Your Apple Developer email | `developer@example.com` |
| `APPLE_ID_PASSWORD` | App-specific password from Apple ID | `abcd-efgh-ijkl-mnop` |
| `APPLE_TEAM_ID` | Your Apple Developer Team ID | `ABCDEFGH12` |

## Step 6: Verify Setup

After adding all secrets, you can test by:

1. Creating a git tag: `git tag v0.7.0 && git push origin v0.7.0`
2. Or manually triggering the release workflow in GitHub Actions

The workflow will:
- Build your app for both Intel and Apple Silicon
- Sign the .app bundle with your Developer ID
- Create DMG installers
- Notarize the DMGs with Apple
- Upload signed and notarized DMGs to the GitHub release

## Troubleshooting

### "No signing identity found"
- Make sure the certificate is installed in Keychain Access
- Verify the base64 encoding was done correctly
- Check that APPLE_CERTIFICATE_PASSWORD is correct

### "Notarization failed"
- Verify APPLE_ID and APPLE_ID_PASSWORD are correct
- Make sure APPLE_TEAM_ID matches your Apple Developer account
- Check that your app is properly signed before notarization

### "Certificate has expired"
- Developer ID certificates are valid for 5 years
- You'll need to create a new certificate and update the secrets

## Security Notes

- Never commit certificates or passwords to git
- Store the .p12 file securely (password manager or encrypted storage)
- Rotate app-specific passwords periodically
- Review GitHub Actions logs carefully - secrets are masked but be cautious

## Cost

- Apple Developer Program: $99/year
- GitHub Actions: Free for public repos, included minutes for private repos
- No additional cost for code signing or notarization
