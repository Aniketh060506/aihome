# CyberAI - Desktop Setup & EXE Packaging Guide

## 🖥️ Running on Desktop (Windows/Mac/Linux)

### Prerequisites

#### Windows
1. **Install Python 3.10+**: https://www.python.org/downloads/
   - ✅ Check "Add Python to PATH" during installation
2. **Install Node.js 18+**: https://nodejs.org/
3. **Install MongoDB**: https://www.mongodb.com/try/download/community
4. **Install Git** (optional): https://git-scm.com/downloads

#### Mac
```bash
# Install Homebrew if not installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install dependencies
brew install python@3.10 node mongodb-community git
brew services start mongodb-community
```

#### Linux (Ubuntu/Debian)
```bash
# Update system
sudo apt update

# Install Python, Node.js, MongoDB
sudo apt install python3.10 python3-pip nodejs npm mongodb git
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

---

## 📦 Step 1: Clone/Download the Project

### Option A: If you have Git
```bash
# Clone to your desktop
cd ~/Desktop
git clone <your-repo-url> CyberAI
cd CyberAI
```

### Option B: Manual Download
1. Download project as ZIP
2. Extract to `C:\Users\YourName\Desktop\CyberAI` (Windows) or `~/Desktop/CyberAI` (Mac/Linux)

---

## 🚀 Step 2: Setup Backend

```bash
# Navigate to backend folder
cd /path/to/CyberAI/backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
# Windows:
echo MONGO_URL=mongodb://localhost:27017 > .env
echo DB_NAME=cyberai_db >> .env
echo CORS_ORIGINS=* >> .env

# Mac/Linux:
cat > .env << EOL
MONGO_URL=mongodb://localhost:27017
DB_NAME=cyberai_db
CORS_ORIGINS=*
EOL
```

---

## 🎨 Step 3: Setup Frontend

```bash
# Navigate to frontend folder
cd /path/to/CyberAI/frontend

# Install Yarn globally (if not installed)
npm install -g yarn

# Install dependencies
yarn install

# Create .env file
# Windows:
echo REACT_APP_BACKEND_URL=http://localhost:8001 > .env

# Mac/Linux:
cat > .env << EOL
REACT_APP_BACKEND_URL=http://localhost:8001
EOL
```

---

## ▶️ Step 4: Run the Application

### Terminal 1 - Start MongoDB (if not running as service)
```bash
# Windows:
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath C:\data\db

# Mac (if not started with brew):
mongod --config /usr/local/etc/mongod.conf

# Linux (if not started with systemctl):
sudo systemctl start mongodb
```

### Terminal 2 - Start Backend
```bash
cd /path/to/CyberAI/backend
# Activate venv if not activated
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

# Run backend
uvicorn server:app --host 127.0.0.1 --port 8001 --reload
```

### Terminal 3 - Start Frontend
```bash
cd /path/to/CyberAI/frontend
yarn start
```

### ✅ Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8001/api/

---

## 📦 Creating Desktop Application (.exe for Windows)

### Option 1: Using Electron (Recommended)

#### Step 1: Install Electron
```bash
cd /path/to/CyberAI/frontend
yarn add electron electron-builder concurrently wait-on --dev
```

#### Step 2: Create Electron Main File

Create `frontend/public/electron.js`:
```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let backendProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    icon: path.join(__dirname, 'logo.png')
  });

  mainWindow.loadURL('http://localhost:3000');
  
  mainWindow.on('closed', function () {
    mainWindow = null;
    if (backendProcess) {
      backendProcess.kill();
    }
  });
}

function startBackend() {
  const pythonPath = process.platform === 'win32' 
    ? path.join(__dirname, '../../backend/venv/Scripts/python.exe')
    : path.join(__dirname, '../../backend/venv/bin/python');
  
  const serverPath = path.join(__dirname, '../../backend/server.py');
  
  backendProcess = spawn(pythonPath, ['-m', 'uvicorn', 'server:app', '--host', '127.0.0.1', '--port', '8001'], {
    cwd: path.join(__dirname, '../../backend')
  });

  backendProcess.stdout.on('data', (data) => {
    console.log(`Backend: ${data}`);
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(`Backend Error: ${data}`);
  });
}

app.on('ready', () => {
  startBackend();
  setTimeout(createWindow, 3000); // Wait for backend to start
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});
```

#### Step 3: Update package.json

Add to `frontend/package.json`:
```json
{
  "main": "public/electron.js",
  "homepage": "./",
  "scripts": {
    "start": "craco start",
    "build": "craco build",
    "electron": "electron .",
    "electron-dev": "concurrently \"yarn start\" \"wait-on http://localhost:3000 && electron .\"",
    "electron-build": "yarn build && electron-builder",
    "pack": "electron-builder --dir",
    "dist": "electron-builder"
  },
  "build": {
    "appId": "com.cyberai.app",
    "productName": "CyberAI",
    "files": [
      "build/**/*",
      "node_modules/**/*",
      "public/electron.js",
      "../backend/**/*"
    ],
    "directories": {
      "buildResources": "public"
    },
    "win": {
      "target": ["nsis"],
      "icon": "public/logo.png"
    },
    "mac": {
      "target": ["dmg"],
      "icon": "public/logo.png"
    },
    "linux": {
      "target": ["AppImage"],
      "icon": "public/logo.png"
    }
  }
}
```

#### Step 4: Build Desktop Application

```bash
cd /path/to/CyberAI/frontend

# Build frontend
yarn build

# Create desktop app
# Windows .exe:
yarn electron-build --win

# Mac .dmg:
yarn electron-build --mac

# Linux AppImage:
yarn electron-build --linux
```

**Output Location:**
- Windows: `frontend/dist/CyberAI Setup.exe`
- Mac: `frontend/dist/CyberAI.dmg`
- Linux: `frontend/dist/CyberAI.AppImage`

---

### Option 2: Using PyInstaller (Backend) + Electron (Frontend)

#### Step 1: Package Backend as Executable

Create `backend/build.spec`:
```python
# -*- mode: python ; coding: utf-8 -*-

block_cipher = None

a = Analysis(
    ['server.py'],
    pathex=[],
    binaries=[],
    datas=[('.env', '.'), ('models.py', '.'), ('ai_service.py', '.')],
    hiddenimports=['uvicorn.logging', 'uvicorn.loops', 'uvicorn.loops.auto', 'uvicorn.protocols', 'uvicorn.protocols.http', 'uvicorn.protocols.http.auto', 'uvicorn.protocols.websockets', 'uvicorn.protocols.websockets.auto', 'uvicorn.lifespan', 'uvicorn.lifespan.on'],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='cyberai-backend',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
```

#### Step 2: Build Backend

```bash
cd /path/to/CyberAI/backend

# Install PyInstaller
pip install pyinstaller

# Build
pyinstaller build.spec

# Output: backend/dist/cyberai-backend.exe (Windows)
```

#### Step 3: Integrate with Electron

Update `electron.js` to use the packaged backend executable instead of Python.

---

### Option 3: Simple Batch/Shell Script (Easiest)

#### For Windows - Create `start-cyberai.bat`:

```batch
@echo off
echo Starting CyberAI...

REM Start MongoDB
start "MongoDB" "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath C:\data\db

REM Start Backend
cd /d "%~dp0backend"
start "Backend" cmd /k "venv\Scripts\activate && uvicorn server:app --host 127.0.0.1 --port 8001"

REM Wait 3 seconds
timeout /t 3 /nobreak

REM Start Frontend
cd /d "%~dp0frontend"
start "Frontend" cmd /k "yarn start"

echo CyberAI is starting...
echo Frontend: http://localhost:3000
echo Backend: http://localhost:8001/api/
pause
```

#### For Mac/Linux - Create `start-cyberai.sh`:

```bash
#!/bin/bash

echo "Starting CyberAI..."

# Start MongoDB (if not running)
if ! pgrep -x "mongod" > /dev/null; then
    echo "Starting MongoDB..."
    mongod --fork --logpath /tmp/mongodb.log
fi

# Start Backend
cd "$(dirname "$0")/backend"
source venv/bin/activate
uvicorn server:app --host 127.0.0.1 --port 8001 &
BACKEND_PID=$!

# Wait for backend
sleep 3

# Start Frontend
cd "$(dirname "$0")/frontend"
yarn start &
FRONTEND_PID=$!

echo "CyberAI is running!"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:8001/api/"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
```

Make executable:
```bash
chmod +x start-cyberai.sh
./start-cyberai.sh
```

---

## 🎁 Option 4: Complete Installer with Inno Setup (Windows)

### Step 1: Install Inno Setup
Download from: https://jrsoftware.org/isdl.php

### Step 2: Create Installer Script

Create `installer.iss`:
```ini
[Setup]
AppName=CyberAI
AppVersion=1.0
DefaultDirName={pf}\CyberAI
DefaultGroupName=CyberAI
OutputDir=output
OutputBaseFilename=CyberAI-Setup
Compression=lzma2
SolidCompression=yes

[Files]
Source: "backend\*"; DestDir: "{app}\backend"; Flags: recursesubdirs
Source: "frontend\build\*"; DestDir: "{app}\frontend"; Flags: recursesubdirs
Source: "start-cyberai.bat"; DestDir: "{app}"

[Icons]
Name: "{group}\CyberAI"; Filename: "{app}\start-cyberai.bat"
Name: "{commondesktop}\CyberAI"; Filename: "{app}\start-cyberai.bat"

[Run]
Filename: "{app}\start-cyberai.bat"; Description: "Launch CyberAI"; Flags: postinstall shellexec
```

### Step 3: Build Installer
1. Open `installer.iss` in Inno Setup
2. Click **Build** → **Compile**
3. Output: `output/CyberAI-Setup.exe`

---

## 📊 Comparison of Methods

| Method | Pros | Cons | File Size | Complexity |
|--------|------|------|-----------|-----------|
| **Electron** | Native app, cross-platform | Large size (~200MB) | Large | Medium |
| **PyInstaller + Electron** | Full control | Complex setup | Very Large | High |
| **Batch/Shell Script** | Simple, small | Requires Python/Node | Small | Easy |
| **Inno Setup Installer** | Professional installer | Windows only | Medium | Medium |

---

## 🎯 Recommended Approach

### For Beginners:
**Use Batch/Shell Script** - Easiest to set up and maintain

### For Distribution:
**Use Electron + electron-builder** - Professional, cross-platform application

### For Enterprise:
**Use PyInstaller + Electron + Inno Setup** - Complete control, all dependencies bundled

---

## 🔧 Troubleshooting

### Issue: "Module not found"
```bash
# Reinstall dependencies
pip install -r requirements.txt
yarn install
```

### Issue: "Port already in use"
```bash
# Windows - Kill process on port 8001
netstat -ano | findstr :8001
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:8001 | xargs kill -9
```

### Issue: "MongoDB not starting"
```bash
# Windows - Check MongoDB service
sc query MongoDB

# Mac
brew services list

# Linux
sudo systemctl status mongodb
```

### Issue: Electron app crashes
- Check backend is running: `curl http://localhost:8001/api/`
- Check logs in terminal
- Ensure MongoDB is accessible

---

## 📝 Next Steps

1. ✅ Choose your deployment method
2. ✅ Follow the steps above
3. ✅ Test the application
4. ✅ Distribute to users!

**Need help? Check `QUICK_REFERENCE.md` for common commands!**
