import os
import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer, Trainer, TrainingArguments
from datasets import Dataset

# ==============================================================================
# FORESTGUARD HUNTING DETECTION LLM - TRAINING SCRIPT
# ==============================================================================
# This script demonstrates how to fine-tune a lightweight language model 
# (like DistilBERT) to classify acoustic sensor logs or drone metadata 
# to detect illegal hunting / poaching activity.
# 
# In a real-world scenario, you would use a multimodal model (Vision+Text) 
# like LLaVA or a CNN for camera traps, but this shows the NLP approach 
# for classifying sensor telemetry and audio transcriptions.
# ==============================================================================

def prepare_dummy_dataset():
    """
    Creates a small synthetic dataset for training.
    0 = Normal forest activity (Wind, rain, animals)
    1 = Suspicious activity (Human voices, footsteps)
    2 = Definite Poaching/Hunting (Gunshots, vehicle engines, chainsaw)
    """
    data = {
        "text": [
            "Heavy rain and thunder detected in Sector 4.",
            "Continuous bird calls and monkey chatter.",
            "Sound of a vehicle engine revving off-road at 2 AM.",
            "Loud sharp crack followed by silence. Possible gunshot.",
            "Human voices speaking softly near the restricted perimeter.",
            "Normal wind speeds, branches creaking.",
            "Metallic clinking and digging sounds detected.",
            "Multiple dog barks accompanied by human whistles."
        ],
        "label": [0, 0, 2, 2, 1, 0, 1, 2]
    }
    return Dataset.from_dict(data)

def train_model():
    print("Initializing ForestGuard Hunting Detection Model Training...")
    
    # Use a small, fast model for demonstration
    model_name = "distilbert-base-uncased"
    num_labels = 3 # 0: Safe, 1: Suspicious, 2: Critical Hunting
    
    print(f"Loading tokenizer: {model_name}")
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    
    print(f"Loading base model: {model_name}")
    model = AutoModelForSequenceClassification.from_pretrained(model_name, num_labels=num_labels)
    
    print("Preparing dataset...")
    dataset = prepare_dummy_dataset()
    
    # Tokenize the dataset
    def tokenize_function(examples):
        return tokenizer(examples["text"], padding="max_length", truncation=True, max_length=64)
    
    tokenized_datasets = dataset.map(tokenize_function, batched=True)
    
    # Split into train/test
    tokenized_datasets = tokenized_datasets.train_test_split(test_size=0.2)
    
    print("Setting up Training Arguments...")
    training_args = TrainingArguments(
        output_dir="./models/hunting_llm",
        learning_rate=2e-5,
        per_device_train_batch_size=4,
        per_device_eval_batch_size=4,
        num_train_epochs=3,
        weight_decay=0.01,
        eval_strategy="epoch",
        save_strategy="epoch",
        logging_steps=2,
    )
    
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_datasets["train"],
        eval_dataset=tokenized_datasets["test"],
    )
    
    print("Starting fine-tuning... (This requires GPU compute for real datasets)")
    trainer.train()
    
    print("Training complete! Model saved to ./models/hunting_llm")
    
    # Save the tokenizer and model manually for inference
    model.save_pretrained("./models/hunting_llm_final")
    tokenizer.save_pretrained("./models/hunting_llm_final")

if __name__ == "__main__":
    print("-" * 60)
    print("WARNING: This is a demonstration script.")
    print("To train a real model, you need a large dataset of acoustic")
    print("signatures or camera trap images, and a GPU environment.")
    print("-" * 60)
    train_model()
