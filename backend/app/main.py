"""
Business Case Command Center - Flask Backend
"""
from flask import Flask, render_template, jsonify

from app.routers import data, export, ai_auditor


def create_app():
    app = Flask(__name__, 
                template_folder='templates',
                static_folder='static')
    
    app.config['SECRET_KEY'] = 'business-case-command-center-secret-key'
    
    # Register blueprints
    app.register_blueprint(data.bp, url_prefix='/api/data')
    app.register_blueprint(export.bp, url_prefix='/api/export')
    app.register_blueprint(ai_auditor.bp, url_prefix='/api/ai')
    
    @app.route('/')
    def index():
        return render_template('index.html')
    
    @app.route('/health')
    def health_check():
        return jsonify({"status": "healthy"})
    
    return app


app = create_app()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)
