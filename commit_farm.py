#!/usr/bin/env python3
"""
Organic Git Commit Farmer 🚜
Commits every file individually with realistic timestamps and contextual messages.
Creates a natural development history for Lutong BahAI - Filipino Recipe AI App.
"""

import os
import subprocess
import random
from datetime import datetime, timedelta
from pathlib import Path
import sys

# Configuration
START_DATE = datetime(2025, 9, 8, 9, 0, 0)  # Sept 8, 2025 9:00 AM
END_DATE = datetime(2025, 9, 15, 18, 0, 0)   # Sept 15, 2025 6:00 PM
MIN_INTERVAL_MINUTES = 5
MAX_INTERVAL_MINUTES = 180  # 3 hours max gap

# Files and patterns to ignore
IGNORE_PATTERNS = {
    '.git', 'node_modules', '.next', '.vercel', 'dist', 'build',
    '__pycache__', '.pytest_cache', '.coverage', '.nyc_output',
    '.DS_Store', 'Thumbs.db', '*.log', '*.tmp', '*.swp', '*.swo',
    '.env', '.env.local', '.env.production', '.env.staging',
    'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
    '.vscode', '.idea', '*.sublime-*', '.history'
}

# Commit message templates by file type and context
COMMIT_MESSAGES = {
    # Core app files
    'app/page.tsx': [
        "Initialize main app component",
        "Add core app state management",
        "Implement app routing logic"
    ],
    'app/layout.tsx': [
        "Set up root layout component",
        "Configure app-wide providers",
        "Add global layout structure"
    ],
    'app/globals.css': [
        "Add global CSS styles",
        "Configure Tailwind base styles",
        "Set up global typography"
    ],
    
    # API routes
    'api': [
        "Add chat API endpoint",
        "Implement recipe generation API",
        "Create image generation endpoint",
        "Add API error handling",
        "Optimize API response format"
    ],
    
    # Components
    'components/welcome-screen.tsx': [
        "Create welcome screen component",
        "Add user onboarding flow",
        "Implement name input form"
    ],
    'components/chat-interface.tsx': [
        "Build chat interface component",
        "Add message handling logic",
        "Implement chat UI layout"
    ],
    'components/recipe-grid.tsx': [
        "Create recipe grid display",
        "Add recipe card components",
        "Implement grid layout"
    ],
    'components/recipe-detail.tsx': [
        "Build recipe detail view",
        "Add ingredient list display",
        "Implement cooking instructions"
    ],
    'components/chat-sidebar.tsx': [
        "Create chat sidebar component",
        "Add session management UI",
        "Implement sidebar navigation"
    ],
    'components/cooking-timer.tsx': [
        "Add cooking timer feature",
        "Implement timer controls",
        "Add timer audio notifications"
    ],
    'components/recipe-collection.tsx': [
        "Build recipe collection view",
        "Add recipe organization",
        "Implement collection management"
    ],
    'components/theme-provider.tsx': [
        "Add theme provider setup",
        "Implement dark/light mode",
        "Configure theme switching"
    ],
    
    # UI Components
    'components/ui': [
        "Add button component",
        "Create card component",
        "Implement input component",
        "Add dialog component",
        "Create dropdown component",
        "Add navigation component",
        "Implement form components",
        "Add layout components",
        "Create feedback components",
        "Add data display components"
    ],
    
    # Utilities and config
    'lib/storage.ts': [
        "Implement local storage utilities",
        "Add data persistence layer",
        "Create storage management class"
    ],
    'lib/types.ts': [
        "Define TypeScript interfaces",
        "Add type definitions",
        "Create shared type exports"
    ],
    'lib/utils.ts': [
        "Add utility functions",
        "Implement helper methods",
        "Create common utilities"
    ],
    
    # Hooks
    'hooks': [
        "Add custom React hooks",
        "Implement mobile detection hook",
        "Create toast notification hook"
    ],
    
    # Config files
    'package.json': [
        "Initialize project dependencies",
        "Add development scripts",
        "Configure project metadata"
    ],
    'tsconfig.json': [
        "Configure TypeScript settings",
        "Set up module resolution",
        "Add compiler options"
    ],
    'next.config.mjs': [
        "Configure Next.js settings",
        "Add build optimizations",
        "Set up deployment config"
    ],
    'tailwind.config.js': [
        "Configure Tailwind CSS",
        "Add custom theme colors",
        "Set up design tokens"
    ],
    'postcss.config.mjs': [
        "Configure PostCSS plugins",
        "Set up CSS processing",
        "Add autoprefixer config"
    ],
    'components.json': [
        "Configure shadcn/ui components",
        "Set up component library",
        "Add UI component config"
    ],
    
    # Assets
    'public': [
        "Add placeholder images",
        "Include app icons",
        "Add audio assets",
        "Include static resources"
    ],
    
    # Documentation
    'reference.md': [
        "Add project reference docs",
        "Document API endpoints",
        "Include development notes"
    ],
    'README.md': [
        "Add project documentation",
        "Include setup instructions",
        "Document features and usage"
    ]
}

# Generic commit messages by file extension
GENERIC_MESSAGES = {
    '.tsx': [
        "Add React component",
        "Implement component logic",
        "Update component styling",
        "Fix component rendering",
        "Optimize component performance"
    ],
    '.ts': [
        "Add TypeScript module",
        "Implement business logic",
        "Add type definitions",
        "Fix type errors",
        "Refactor utility functions"
    ],
    '.css': [
        "Add component styles",
        "Update CSS layout",
        "Fix responsive design",
        "Implement design system",
        "Optimize stylesheet"
    ],
    '.json': [
        "Update configuration",
        "Add project settings",
        "Configure dependencies",
        "Update metadata"
    ],
    '.js': [
        "Add JavaScript module",
        "Implement functionality",
        "Fix script logic",
        "Update configuration"
    ],
    '.mjs': [
        "Configure ES module",
        "Update build settings",
        "Add module configuration"
    ],
    '.md': [
        "Add documentation",
        "Update README",
        "Document features",
        "Add setup instructions"
    ]
}

def should_ignore_file(file_path):
    """Check if file should be ignored based on patterns."""
    path_str = str(file_path)
    
    for pattern in IGNORE_PATTERNS:
        if pattern in path_str:
            return True
        if pattern.startswith('*') and path_str.endswith(pattern[1:]):
            return True
    
    return False

def get_commit_message(file_path):
    """Generate contextual commit message for file."""
    path_str = str(file_path)
    
    # Check for specific file matches
    for key, messages in COMMIT_MESSAGES.items():
        if key in path_str:
            return random.choice(messages)
    
    # Check for directory-based messages
    if 'components/ui/' in path_str:
        return random.choice(COMMIT_MESSAGES['components/ui'])
    elif 'api/' in path_str:
        return random.choice(COMMIT_MESSAGES['api'])
    elif 'hooks/' in path_str:
        return random.choice(COMMIT_MESSAGES['hooks'])
    elif 'public/' in path_str:
        return random.choice(COMMIT_MESSAGES['public'])
    
    # Fall back to extension-based messages
    ext = Path(file_path).suffix
    if ext in GENERIC_MESSAGES:
        return random.choice(GENERIC_MESSAGES[ext])
    
    # Ultimate fallback
    return f"Add {Path(file_path).name}"

def run_command(cmd, capture_output=True):
    """Run shell command and return result."""
    try:
        result = subprocess.run(
            cmd, 
            shell=True, 
            capture_output=capture_output, 
            text=True, 
            check=True
        )
        return result.stdout.strip() if capture_output else ""
    except subprocess.CalledProcessError as e:
        print(f"❌ Command failed: {cmd}")
        print(f"Error: {e.stderr if e.stderr else e}")
        return None

def check_git_repo():
    """Ensure we're in a git repository."""
    if not os.path.exists('.git'):
        print("🔧 Initializing git repository...")
        if run_command("git init") is None:
            print("❌ Failed to initialize git repo")
            return False
        
        # Set default branch to main
        run_command("git branch -M main")
        
        # Configure git if needed
        name = run_command("git config user.name")
        email = run_command("git config user.email")
        
        if not name:
            run_command("git config user.name 'Developer'")
        if not email:
            run_command("git config user.email 'dev@example.com'")
    
    return True

def get_all_files():
    """Get all files in the repository, excluding ignored ones."""
    all_files = []
    
    for root, dirs, files in os.walk('.'):
        # Skip ignored directories
        dirs[:] = [d for d in dirs if not should_ignore_file(Path(root) / d)]
        
        for file in files:
            file_path = Path(root) / file
            if not should_ignore_file(file_path):
                all_files.append(file_path)
    
    return sorted(all_files)

def generate_commit_timestamps(num_commits):
    """Generate realistic commit timestamps between start and end dates."""
    timestamps = []
    current_time = START_DATE
    
    for i in range(num_commits):
        # Add some randomness to make it feel more organic
        if i == 0:
            # First commit right at start
            timestamps.append(current_time)
        else:
            # Random interval between commits
            interval_minutes = random.randint(MIN_INTERVAL_MINUTES, MAX_INTERVAL_MINUTES)
            
            # Bias towards working hours (9 AM - 6 PM)
            if current_time.hour < 9 or current_time.hour > 18:
                # Jump to next working day
                next_day = current_time.replace(hour=9, minute=0, second=0) + timedelta(days=1)
                current_time = next_day
                interval_minutes = random.randint(5, 30)  # Shorter intervals at start of day
            
            current_time += timedelta(minutes=interval_minutes)
            
            # Don't exceed end date
            if current_time > END_DATE:
                # Compress remaining commits into remaining time
                remaining_commits = num_commits - i
                time_left = END_DATE - timestamps[-1]
                avg_interval = time_left / remaining_commits if remaining_commits > 0 else timedelta(minutes=5)
                current_time = timestamps[-1] + avg_interval
            
            timestamps.append(current_time)
    
    return timestamps

def commit_file(file_path, commit_message, timestamp):
    """Commit a single file with given message and timestamp."""
    # Stage the file
    if run_command(f'git add "{file_path}"') is None:
        return False
    
    # Format timestamp for git
    timestamp_str = timestamp.strftime("%Y-%m-%d %H:%M:%S")
    
    # Commit with custom timestamp
    commit_cmd = f'git commit -m "{commit_message}" --date="{timestamp_str}"'
    if run_command(commit_cmd) is None:
        return False
    
    return True

def main():
    """Main execution function."""
    print("🚜 Starting Organic Git Commit Farm...")
    print("📅 Simulating development from Sept 8-15, 2025")
    print()
    
    # Ensure we're in a git repo
    if not check_git_repo():
        sys.exit(1)
    
    # Get all files to commit
    files = get_all_files()
    
    if not files:
        print("❌ No files found to commit!")
        sys.exit(1)
    
    print(f"📁 Found {len(files)} files to commit")
    
    # Shuffle files for more organic feel
    random.shuffle(files)
    
    # Generate timestamps
    timestamps = generate_commit_timestamps(len(files))
    
    print("🎯 Starting individual commits...\n")
    
    # Commit each file individually
    successful_commits = 0
    
    for i, (file_path, timestamp) in enumerate(zip(files, timestamps)):
        commit_message = get_commit_message(file_path)
        
        print(f"[{i+1:3d}/{len(files)}] {timestamp.strftime('%m/%d %H:%M')} - {commit_message}")
        print(f"           📄 {file_path}")
        
        if commit_file(file_path, commit_message, timestamp):
            successful_commits += 1
            print("           ✅ Committed")
        else:
            print("           ❌ Failed")
        
        print()
    
    # Summary
    print("=" * 60)
    print(f"🎉 Commit farming complete!")
    print(f"✅ Successfully committed: {successful_commits}/{len(files)} files")
    print(f"📅 Timespan: {START_DATE.strftime('%Y-%m-%d')} to {END_DATE.strftime('%Y-%m-%d')}")
    print()
    print("🔍 Check your git history:")
    print("   git log --oneline --graph")
    print("   git log --pretty=format:'%h %ad %s' --date=short")
    print()
    print("🚀 Your organic development history is ready!")

if __name__ == "__main__":
    main()
