from google.cloud import storage
import tensorflow as tf
from PIL import Image
import numpy as np
import cv2

model = None
class_names = [
    "Healthy Leaf",
    "Insect Pest Disease",
    "Leaf Spot Disease",
    "Mosaic Virus Disease",
    "Small Leaf Disease",
    "White Mold Disease",
    "Wilt Disease"
]

BUCKET_NAME = "eggplant-model"  # Replace with your GCP bucket name

def download_blob(bucket_name, source_blob_name, destination_file_name):
    """Downloads a blob from the bucket."""
    storage_client = storage.Client()
    bucket = storage_client.get_bucket(bucket_name)
    blob = bucket.blob(source_blob_name)

    blob.download_to_filename(destination_file_name)

    print(f"Blob {source_blob_name} downloaded to {destination_file_name}.")

def is_leaf(image):
    # Convert image to numpy array
    image = np.array(image)
    
    # Convert image to HSV color space
    hsv = cv2.cvtColor(image, cv2.COLOR_RGB2HSV)
    
    # Define range of green color in HSV
    lower_green = np.array([35, 40, 40])
    upper_green = np.array([85, 255, 255])
    
    # Create a mask to isolate green regions
    mask = cv2.inRange(hsv, lower_green, upper_green)
    
    # Calculate percentage of green pixels
    green_ratio = np.sum(mask > 0) / (mask.shape[0] * mask.shape[1])
    
    # Threshold for green detection
    threshold = 0.05  # Adjust as needed
    
    return green_ratio > threshold

def predict(request):
    global model
    if model is None:
        download_blob(
            BUCKET_NAME,
            "models/Eggplant_v1_fixed_temp.h5",
            "/tmp/Eggplant_v1_fixed_temp.h5",
        )
        model = tf.keras.models.load_model("/tmp/Eggplant_v1_fixed_temp.h5")

    if "file" not in request.files:
        return {"error": "No file uploaded."}

    image = request.files["file"]
    
    # Open and resize image
    img = Image.open(image)
    img = img.convert("RGB").resize((512, 512))
    
    # Check if image contains a leaf (green detection)
    if not is_leaf(img):
        return {"message": "Please upload an image containing a leaf."}

    # Convert image to numpy array and normalize
    img_array = np.array(img) / 255.0
    
    # Expand dimensions and make predictions
    img_array = tf.expand_dims(img_array, 0)
    predictions = model.predict(img_array)

    print("Predictions:", predictions)

    predicted_class = class_names[np.argmax(predictions[0])]
    confidence = round(100 * np.max(predictions[0]), 2)

    if confidence > 95:
        return {"class": predicted_class, "confidence": confidence}
    else:
        return {"message": "Please upload a higher quality image."}
