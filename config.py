import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Base configuration."""
    SECRET_KEY = os.environ.get('SECRET_KEY', 'feastflow-secret-key-change-in-production')
    db_url = os.environ.get('DATABASE_URL')
    if db_url and db_url.startswith('mysql://'):
        db_url = db_url.replace('mysql://', 'mysql+pymysql://', 1)
        
    SQLALCHEMY_DATABASE_URI = db_url or 'mysql+pymysql://root:sohaib2006@localhost/feastflow'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    WTF_CSRF_ENABLED = True

    # Enable SSL connection for cloud databases (like Aiven) but disable for local development
    if db_url and 'localhost' not in db_url and '127.0.0.1' not in db_url:
        SQLALCHEMY_ENGINE_OPTIONS = {
            "connect_args": {
                "ssl": {}
            }
        }


class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True


class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False


config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
