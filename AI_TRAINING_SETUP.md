# 🤖 AI Model Training Setup Guide for ThreeAI

## Overview
This guide helps you set up AI-powered 3D model generation for your ThreeAI project using open-source tools and platforms.

## 🚀 Quick Start Options

### Option 1: Use Existing APIs (Recommended for beginners)
- **Hugging Face** (Free tier): Ready-to-use models
- **Replicate** (Paid): High-quality generations
- **Ready2Use**: No setup required

### Option 2: Self-Hosted Local AI (Advanced)
- **Point-E**: OpenAI's point cloud generation
- **Shap-E**: OpenAI's 3D shape generation
- **Custom Training**: Train your own models

### Option 3: Hybrid Approach (Recommended)
- Use APIs for complex models
- Local generation for basic shapes
- Fallback to procedural generation

## 🛠️ Setup Instructions

### 1. Hugging Face Integration (FREE)

```bash
# No installation required - API only
# Get free API token from: https://huggingface.co/settings/tokens
```

**Benefits:**
- ✅ Free tier (1000 requests/month)
- ✅ No setup required
- ✅ OpenAI Shap-E and Point-E models
- ✅ Good quality output

**Usage:**
```javascript
// Already integrated in ai-integration.js
const aiGen = new AIModelGenerator();
const model = await aiGen.generateWithShapE('red sports car');
```

### 2. Local Point-E Setup

```bash
# Clone Point-E repository
git clone https://github.com/openai/point-e.git
cd point-e

# Create virtual environment
python -m venv point-e-env
source point-e-env/bin/activate  # On Windows: point-e-env\Scripts\activate

# Install dependencies
pip install -e .
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
```

**Create local server (server.py):**
```python
from flask import Flask, request, jsonify, send_file
from point_e.diffusion.configs import DIFFUSION_CONFIGS
from point_e.diffusion.sampler import PointCloudSampler
from point_e.models.download import load_checkpoint
from point_e.plot import plot_point_cloud
import torch
import io
import tempfile

app = Flask(__name__)

# Load models
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = load_checkpoint('base40M-textvec', device)
diffusion = DIFFUSION_CONFIGS['base40M-textvec']
sampler = PointCloudSampler(
    device=device,
    models=[model],
    diffusions=[diffusion],
)

@app.route('/generate', methods=['POST'])
def generate_model():
    data = request.json
    prompt = data.get('prompt', '')
    
    # Generate point cloud
    samples = sampler.sample_batch_progressive(
        batch_size=1,
        model_kwargs=dict(texts=[prompt]),
    )
    
    # Convert to PLY format
    pc = samples[-1][0]
    
    # Save to temporary file
    temp_file = tempfile.NamedTemporaryFile(suffix='.ply', delete=False)
    plot_point_cloud(pc, output_path=temp_file.name)
    
    return send_file(temp_file.name, as_attachment=True)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
```

### 3. Training Custom Models

#### A. Dataset Preparation

```python
# dataset_creator.py
import os
import json
from pathlib import Path

def create_training_dataset():
    """
    Create dataset for training custom 3D models
    """
    dataset = {
        "shapes": {
            "furniture": {
                "chair": ["wooden chair", "office chair", "dining chair"],
                "table": ["coffee table", "dining table", "work desk"],
                "bookshelf": ["tall bookshelf", "modern bookshelf"]
            },
            "vehicles": {
                "car": ["sports car", "sedan", "SUV", "vintage car"],
                "motorcycle": ["sport bike", "cruiser", "dirt bike"],
                "airplane": ["passenger jet", "fighter jet", "small plane"]
            },
            "nature": {
                "tree": ["oak tree", "pine tree", "palm tree", "bonsai"],
                "flower": ["rose", "sunflower", "tulip", "orchid"],
                "mountain": ["snow mountain", "rocky mountain", "hill"]
            }
        },
        "styles": [
            "realistic", "cartoon", "low-poly", "modern", 
            "vintage", "futuristic", "minimalist"
        ],
        "colors": [
            "red", "blue", "green", "yellow", "black", 
            "white", "brown", "silver", "gold"
        ]
    }
    
    # Generate training prompts
    training_prompts = []
    for category, items in dataset["shapes"].items():
        for item, variations in items.items():
            for variation in variations:
                for style in dataset["styles"]:
                    for color in dataset["colors"]:
                        prompt = f"{color} {variation} in {style} style"
                        training_prompts.append({
                            "prompt": prompt,
                            "category": category,
                            "item": item,
                            "style": style,
                            "color": color
                        })
    
    return training_prompts

# Save dataset
prompts = create_training_dataset()
with open('training_dataset.json', 'w') as f:
    json.dump(prompts, f, indent=2)

print(f"Generated {len(prompts)} training prompts")
```

#### B. Fine-tuning Setup

```python
# fine_tune.py
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
import json

class TextTo3DDataset(Dataset):
    def __init__(self, prompts_file, models_dir):
        with open(prompts_file, 'r') as f:
            self.prompts = json.load(f)
        self.models_dir = models_dir
    
    def __len__(self):
        return len(self.prompts)
    
    def __getitem__(self, idx):
        prompt_data = self.prompts[idx]
        prompt = prompt_data['prompt']
        
        # Load corresponding 3D model (you'll need to collect these)
        model_path = f"{self.models_dir}/{prompt_data['category']}/{prompt_data['item']}.ply"
        
        return {
            'prompt': prompt,
            'model_path': model_path,
            'metadata': prompt_data
        }

# Training configuration
training_config = {
    "batch_size": 4,
    "learning_rate": 1e-4,
    "epochs": 100,
    "model_type": "point_e",  # or "shap_e"
    "output_dir": "./trained_models"
}
```

### 4. Cloud-Based Training

#### Google Colab Setup
```python
# colab_setup.py
!pip install point-e torch torchvision

# Mount Google Drive for dataset storage
from google.colab import drive
drive.mount('/content/drive')

# Download pre-trained models
import wget
wget.download('https://huggingface.co/openai/point-e/resolve/main/base40M-textvec.pth')
```

#### Kaggle Setup
```bash
# kaggle_setup.sh
pip install point-e kaggle

# Upload dataset to Kaggle
kaggle datasets create -p ./dataset --title "3D-Model-Training-Data"
```

## 📊 Model Performance Comparison

| Method | Quality | Speed | Cost | Setup Difficulty |
|--------|---------|--------|------|------------------|
| Hugging Face API | Good | Fast | Free* | Easy |
| Replicate API | Excellent | Medium | Paid | Easy |
| Local Point-E | Good | Medium | Free | Medium |
| Local Shap-E | Excellent | Slow | Free | Hard |
| Custom Training | Variable | Slow | Free | Very Hard |
| Procedural | Basic | Very Fast | Free | Easy |

## 🎯 Recommended Implementation Strategy

### Phase 1: Basic AI Integration (Week 1)
1. Integrate Hugging Face API
2. Add procedural generation fallback
3. Implement model caching
4. Basic prompt enhancement

### Phase 2: Enhanced Generation (Week 2-3)
1. Add Replicate API integration
2. Implement smart fallback chain
3. Add pre-trained model library
4. Improve prompt processing

### Phase 3: Advanced Features (Week 4+)
1. Set up local AI server
2. Implement custom training pipeline
3. Add model optimization
4. Performance monitoring

## 🔧 Integration with Your Current Code

Update your `main.js` to use AI generation:

```javascript
// Add to your ThreeJSApp class
async parseAndCreateGeometry(prompt) {
    // Try AI generation first
    if (this.aiGenerator) {
        try {
            this.showNotification('Generating with AI...', 'info');
            const aiModel = await this.aiGenerator.generateModel(prompt);
            if (aiModel) {
                this.scene.add(aiModel);
                this.objects.push(aiModel);
                return;
            }
        } catch (error) {
            console.warn('AI generation failed, using fallback:', error);
        }
    }
    
    // Fallback to current procedural generation
    // ... your existing code
}
```

## 📚 Learning Resources

### Tutorials
- [Point-E Documentation](https://github.com/openai/point-e)
- [Shap-E Paper](https://arxiv.org/abs/2305.02463)
- [Three.js Model Loading](https://threejs.org/docs/#manual/en/introduction/Loading-3D-models)

### Datasets
- [ShapeNet](https://shapenet.org/) - Large 3D model dataset
- [ModelNet](https://modelnet.cs.princeton.edu/) - 3D CAD models
- [Objaverse](https://objaverse.allenai.org/) - 800K+ 3D objects

### Open Source Models
- [Point-E](https://github.com/openai/point-e) - MIT License
- [Shap-E](https://github.com/openai/shap-e) - MIT License
- [DreamFusion](https://dreamfusion3d.github.io/) - Research only

## 💡 Pro Tips

1. **Start Simple**: Use API-based solutions before building custom models
2. **Cache Everything**: 3D generation is expensive, cache aggressively
3. **Progressive Enhancement**: Add AI as enhancement, keep procedural fallback
4. **User Feedback**: Let users rate generated models to improve prompts
5. **Quality Control**: Filter and validate AI-generated models before display

## 🚨 Important Considerations

- **Costs**: Monitor API usage to avoid unexpected charges
- **Performance**: AI generation can be slow, show loading states
- **Quality**: AI models may not always generate usable results
- **Legal**: Check licenses for models and training data
- **Privacy**: Be careful with user prompts sent to external APIs

Would you like me to implement any specific part of this AI integration, or would you prefer to start with a particular approach?
