import os
from dotenv import load_dotenv
from google.generativeai import configure, get_model
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

def validate_api_key():
    """Validate the Gemini API key."""
    api_key = os.getenv("GEMINI_API_KEY")
    logger.info(f"Retrieved API key from env: {api_key}")
    
    if not api_key:
        logger.error("GEMINI_API_KEY environment variable not found")
        return False
    
    try:
        # Configure Gemini API
        logger.info("Attempting to configure Gemini API...")
        configure(api_key=api_key)
        logger.info("Gemini API configured successfully")
        
        # Try to get a model instance
        logger.info("Attempting to get model instance...")
        model = get_model('gemini-2.0-flash')
        logger.info("Model instance obtained successfully")
        logger.info(f"API key is valid! {api_key}")
        return True
        
    except Exception as e:
        logger.error(f"API key validation failed: {str(e)}")
        logger.error(f"API key used: {api_key}")
        logger.error(f"Error type: {type(e).__name__}")
        logger.error(f"Full error: {str(e)}")
        return False

if __name__ == "__main__":
    valid = validate_api_key()
    if valid:
        print("✅ API key is valid!")
    else:
        print("❌ API key is invalid. Please check your API key and try again.")
