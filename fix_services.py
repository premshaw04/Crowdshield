import os
import glob
import re

base_dir = r'c:\Users\Lenovo\OneDrive\Desktop\croedshield\Crowdshield\frontend\src\lib\services'
for root, dirs, files in os.walk(base_dir):
    for file in files:
        if file.endswith('.service.ts'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()

            # Remove demo imports
            content = re.sub(r'import\s+.*Demo.*?\s+from\s+[\'"].*?\.demo[\'"];?\n', '', content)
            
            # Remove apiConfig if unused (we might need it, but let's see)
            # Replace apiConfig ternary
            content = re.sub(r'export\s+const\s+(\w+)(:\s+[\w<>]+\s*)?=\s*apiConfig\.IS_DEMO_MODE\s*\n?\s*\?\s*new\s+\w+Demo\(\)\s*\n?\s*:\s*new\s+(\w+Api)\(\);', r'export const \1\2 = new \3();', content)
            
            # For specific ones like uploadsApi, geocodingApi (not classes, maybe objects)
            content = re.sub(r'export\s+const\s+(\w+)(:\s+[\w<>]+\s*)?=\s*apiConfig\.IS_DEMO_MODE\s*\n?\s*\?\s*\w+Demo\s*\n?\s*:\s*(\w+Api);', r'export const \1\2 = \3;', content)

            # For proxy ones
            content = re.sub(r'export\s+const\s+(\w+)(:\s+[\w<>]+\s*)?=\s*new\s+Proxy.*?\}\);', r'import { \1Api } from \'./\1.api\';\nexport const \1\2 = \1Api;', content, flags=re.DOTALL)

            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
