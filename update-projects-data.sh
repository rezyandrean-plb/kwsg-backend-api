#!/bin/bash

echo "🚀 Projects Data Update Tool"
echo "============================"
echo ""

# Check if csv-parser is installed
if ! npm list csv-parser > /dev/null 2>&1; then
    echo "📦 Installing csv-parser dependency..."
    npm install csv-parser
fi

echo ""
echo "Choose an option:"
echo "1. Create sample data files (JSON format)"
echo "2. Create sample CSV files"
echo "3. Import from JSON files"
echo "4. Import from CSV files"
echo "5. Run tests after update"
echo ""

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo ""
        echo "📝 Creating sample JSON data files..."
        node update-projects-data.js --create-samples
        ;;
    2)
        echo ""
        echo "📝 Creating sample CSV files..."
        node import-projects-from-csv.js --create-samples
        ;;
    3)
        echo ""
        echo "📥 Importing from JSON files..."
        echo "Make sure you have the following files:"
        echo "  - projects.json"
        echo "  - project-images.json (optional)"
        echo "  - floor-plans.json (optional)"
        echo "  - unit-availability.json (optional)"
        echo "  - site-plans.json (optional)"
        echo ""
        read -p "Press Enter to continue..."
        node update-projects-data.js --data-files
        ;;
    4)
        echo ""
        echo "📥 Importing from CSV files..."
        echo "Make sure you have the following files:"
        echo "  - projects.csv"
        echo "  - floor-plans.csv (optional)"
        echo "  - unit-availability.csv (optional)"
        echo ""
        read -p "Press Enter to continue..."
        node import-projects-from-csv.js --import
        ;;
    5)
        echo ""
        echo "🧪 Running tests..."
        ./run-projects-tests.sh
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "✅ Operation completed!"
