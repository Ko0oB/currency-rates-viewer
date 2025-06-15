from flask import Flask, render_template, request
import requests
import statistics

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def index():
    rate = None
    history = {'dates': [], 'rates': []}
    error = None
    mean_rate = median_rate = min_rate = max_rate = None
    days = 30
    currency = 'EUR'

    if request.method == 'POST':
        currency = request.form.get('currency', 'EUR').upper()
        days = int(request.form.get('days', 30))

        try:
            # Pobranie aktualnego kursu
            res_now = requests.get(f"https://api.nbp.pl/api/exchangerates/rates/A/{currency}/?format=json")
            res_now.raise_for_status()
            data_now = res_now.json()
            rate = {
                'currency': currency,
                'rate': data_now['rates'][0]['mid'],
                'date': data_now['rates'][0]['effectiveDate']
            }

            # Pobranie historii
            res_hist = requests.get(f"https://api.nbp.pl/api/exchangerates/rates/A/{currency}/last/{days}/?format=json")
            res_hist.raise_for_status()
            data_hist = res_hist.json()
            dates = [entry['effectiveDate'] for entry in data_hist['rates']]
            rates = [entry['mid'] for entry in data_hist['rates']]
            history = {'dates': dates, 'rates': rates}

            mean_rate = round(statistics.mean(rates), 4)
            median_rate = round(statistics.median(rates), 4)
            min_rate = min(rates)
            max_rate = max(rates)

        except Exception as e:
            error = f"Błąd podczas pobierania danych: {e}"

    return render_template(
        'index.html',
        rate=rate,
        error=error,
        history=history,
        days=days,
        mean_rate=mean_rate,
        median_rate=median_rate,
        min_rate=min_rate,
        max_rate=max_rate
    )

if __name__ == '__main__':
    app.run(debug=True)
