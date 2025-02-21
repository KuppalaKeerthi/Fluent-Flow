from flask import Flask, render_template, request, jsonify
from googletrans import Translator, LANGUAGES
import mysql.connector

db_config = {
    "host": "sql12.freesqldatabase.com",
    "user": "sql12763664",
    "password": "KsPGmvP4BV",
    "database": "sql12763664",
    "port": 3306
}

def get_db_connection():
    return mysql.connector.connect(**db_config)

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html', languages=LANGUAGES)
@app.route('/translate', methods=['POST'])
def translate():
    try:
        text = request.json.get('text', '')  # Use `request.json` for JavaScript fetch
        source_lang = request.json.get('source_lang', 'auto')
        target_langs = request.json.get('target_langs', [])

        if not text or not target_langs:
            return jsonify({'success': False, 'error': 'Invalid input parameters'})

        translator = Translator()
        results = {}

        for lang in target_langs:
            translated = translator.translate(text, src=source_lang, dest=lang)
            results[lang] = {"name": LANGUAGES.get(lang, lang), "text": translated.text}
            save_history(text, lang, translated.text)  # Save each translation to DB

        return jsonify({'success': True, 'results': results})

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})
    
def save_history(input_text, target_lang, translated_text):
    """Save translation history to database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = "INSERT INTO translation_history (input_text, target_lang, translated_text) VALUES (%s, %s, %s)"
    cursor.execute(query, (input_text, target_lang, translated_text))

    conn.commit()
    cursor.close()
    conn.close()


@app.route('/history')
def history():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("SELECT * FROM translation_history ORDER BY id DESC")
    history = cursor.fetchall()

    cursor.close()
    conn.close()
    
    return render_template('history.html', history=history)

if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)