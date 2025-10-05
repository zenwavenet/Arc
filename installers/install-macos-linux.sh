#!/usr/bin/env bash
set -e

echo "Installing Arc Programming Language..."
echo ""

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BIN="$ROOT/bin/arc"
CLI="$ROOT/src/cli.js"

if [ ! -f "$CLI" ]; then
  echo "Cannot find $CLI"
  exit 1
fi

cat > "$BIN" << 'EOF'
#!/usr/bin/env node
require('../src/cli.js')
EOF

chmod +x "$BIN"

TARGET="/usr/local/bin/arc"

if [ -w "/usr/local/bin" ]; then
  echo "Installing to $TARGET..."
  ln -sf "$BIN" "$TARGET"
  echo "Installed successfully!"
else
  echo "Installing to $TARGET (requires sudo)..."
  sudo ln -sf "$BIN" "$TARGET"
  echo "Installed successfully!"
fi

echo ""
echo "Arc is now installed!"
echo ""
echo "Try these commands:"
echo "  arc version"
echo "  arc init my-project"
echo "  arc run file.arc"
echo ""
echo "For help: arc help"
echo ""
