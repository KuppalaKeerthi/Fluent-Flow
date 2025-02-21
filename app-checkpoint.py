from flask import Flask, render_template, request
from googletrans import Translator

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def home():
    translated_text = ''
    if request.method == 'POST':
        text_to_translate = request.form['text']
        target_language = request.form['target_language']
        translator = Translator()
        try:
            # Translate text
            translated = translator.translate(text_to_translate, dest=target_language)
            translated_text = translated.text
        except Exception as e:
            translated_text = f"Error: {e}"
    
    return render_template('index.html', translated_text=translated_text)

if __name__ == '__main__':
    app.run(debug=True)
