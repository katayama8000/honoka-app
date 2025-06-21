#!/bin/bash

# Script to clean up IPA and APK files from the project root
# This script removes all .ipa and .apk files in the current directory

echo "🧹 Cleaning up IPA and APK files..."

# Count files before deletion
ipa_count=$(find . -maxdepth 1 -name "*.ipa" | wc -l)
apk_count=$(find . -maxdepth 1 -name "*.apk" | wc -l)

echo "Found ${ipa_count} IPA file(s) and ${apk_count} APK file(s)"

if [ $ipa_count -eq 0 ] && [ $apk_count -eq 0 ]; then
    echo "✅ No IPA or APK files found to clean up"
    exit 0
fi

# Show files that will be deleted
if [ $ipa_count -gt 0 ]; then
    echo "📱 IPA files to be deleted:"
    find . -maxdepth 1 -name "*.ipa" -exec basename {} \;
fi

if [ $apk_count -gt 0 ]; then
    echo "🤖 APK files to be deleted:"
    find . -maxdepth 1 -name "*.apk" -exec basename {} \;
fi

# Ask for confirmation
read -p "❓ Do you want to delete these files? (y/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Delete IPA files
    if [ $ipa_count -gt 0 ]; then
        find . -maxdepth 1 -name "*.ipa" -delete
        echo "🗑️  Deleted ${ipa_count} IPA file(s)"
    fi
    
    # Delete APK files
    if [ $apk_count -gt 0 ]; then
        find . -maxdepth 1 -name "*.apk" -delete
        echo "🗑️  Deleted ${apk_count} APK file(s)"
    fi
    
    echo "✅ Cleanup completed successfully!"
else
    echo "❌ Cleanup cancelled"
    exit 1
fi
