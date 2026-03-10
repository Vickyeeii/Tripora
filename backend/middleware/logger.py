import logging
import sys
from pathlib import Path

# Create logs directory
LOG_DIR = Path("logs")
LOG_DIR.mkdir(exist_ok=True)

# Configure logging format
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"

# Create formatters
formatter = logging.Formatter(LOG_FORMAT, DATE_FORMAT)

# File handler for all logs
file_handler = logging.FileHandler(LOG_DIR / "tripora.log")
file_handler.setLevel(logging.INFO)
file_handler.setFormatter(formatter)

# File handler for errors only
error_handler = logging.FileHandler(LOG_DIR / "errors.log")
error_handler.setLevel(logging.ERROR)
error_handler.setFormatter(formatter)

# Console handler
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setLevel(logging.INFO)
console_handler.setFormatter(formatter)

# Configure root logger
logging.basicConfig(
    level=logging.INFO,
    handlers=[file_handler, error_handler, console_handler]
)

# Create module-specific loggers
def get_logger(name: str):
    return logging.getLogger(name)
