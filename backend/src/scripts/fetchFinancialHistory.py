import sys
import json
import yfinance as yf
import pandas as pd

def safe_float(val):
    if val is None or pd.isna(val):
        return None
    try:
        f = float(val)
        return None if pd.isna(f) else f
    except:
        return None

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "message": "Symbol argument required"}))
        sys.exit(1)

    raw_symbol = sys.argv[1].strip().upper()
    ticker_symbol = raw_symbol if raw_symbol.endswith(".JK") else f"{raw_symbol}.JK"

    try:
        ticker = yf.Ticker(ticker_symbol)
        info = ticker.info or {}
        financial_currency = info.get('financialCurrency') or 'IDR'

        # Ambil kurs real-time USD/IDR jika emiten melaporkan keuangan dalam USD (seperti INCO, MEDC, ITMG, INDY)
        usd_to_idr = 16200.0
        if financial_currency == 'USD':
            try:
                usd_ticker = yf.Ticker("USDIDR=X")
                u_info = usd_ticker.info or {}
                u_price = safe_float(u_info.get('regularMarketPrice') or usd_ticker.fast_info.get('lastPrice'))
                if u_price and u_price > 10000:
                    usd_to_idr = u_price
            except Exception:
                pass
        
        # 1. Annual Financials & Balance Sheet
        fin = ticker.financials
        bs = ticker.balance_sheet
        cf = ticker.cashflow

        annual_items = []
        if fin is not None and not fin.empty:
            years = [col for col in fin.columns]
            # Ambil maksimal 4 tahun terbaru dan urutkan dari tahun terlama ke terbaru (kronologis)
            years = sorted(years)[:4] if len(years) <= 4 else sorted(years)[-4:]

            for col in years:
                date_str = str(col)[:10]
                year_label = f"FY{date_str[:4]}"
                
                # Revenue
                rev = safe_float(fin.loc['Total Revenue', col]) if 'Total Revenue' in fin.index else None
                if rev is None and 'Operating Revenue' in fin.index:
                    rev = safe_float(fin.loc['Operating Revenue', col])
                
                # Net Income
                net_inc = None
                for ni_key in ['Net Income Common Stockholders', 'Net Income', 'Net Income Continuous Operations']:
                    if ni_key in fin.index:
                        net_inc = safe_float(fin.loc[ni_key, col])
                        if net_inc is not None:
                            break
                
                # Total Assets & Liabilities & Equity
                assets = safe_float(bs.loc['Total Assets', col]) if bs is not None and 'Total Assets' in bs.index else None
                equity = None
                if bs is not None:
                    for eq_key in ['Stockholders Equity', 'Common Stock Equity', 'Total Equity Gross Minority Interest']:
                        if eq_key in bs.index:
                            equity = safe_float(bs.loc[eq_key, col])
                            if equity is not None:
                                break
                
                liab = safe_float(bs.loc['Total Liabilities Net Minority Interest', col]) if bs is not None and 'Total Liabilities Net Minority Interest' in bs.index else None
                if liab is None and bs is not None and 'Total Debt' in bs.index:
                    liab = safe_float(bs.loc['Total Debt', col])
                if liab is None and assets is not None and equity is not None:
                    liab = max(0.0, assets - equity)

                # Cash & Equivalents
                cash = None
                if bs is not None:
                    for cash_key in ['Cash And Cash Equivalents', 'Cash Cash Equivalents And Short Term Investments']:
                        if cash_key in bs.index:
                            cash = safe_float(bs.loc[cash_key, col])
                            if cash is not None:
                                break

                # Diluted / Basic EPS
                eps = safe_float(fin.loc['Diluted EPS', col]) if 'Diluted EPS' in fin.index else None
                if eps is None and 'Basic EPS' in fin.index:
                    eps = safe_float(fin.loc['Basic EPS', col])

                formatted_eps = None
                eps_idr = None
                if eps is not None:
                    if financial_currency == 'USD':
                        formatted_eps = round(eps, 4) if abs(eps) < 1 else round(eps, 2)
                        eps_idr = round(eps * usd_to_idr, 2)
                    else:
                        formatted_eps = round(eps, 2)
                        eps_idr = formatted_eps

                # Derived Ratios
                npm = round((net_inc / rev * 100), 2) if (rev and net_inc and rev > 0) else None
                roe = round((net_inc / equity * 100), 2) if (equity and net_inc and equity > 0) else None
                roa = round((net_inc / assets * 100), 2) if (assets and net_inc is not None and assets > 0) else None
                der = round((liab / equity), 2) if (equity and liab is not None and equity > 0) else None

                # Konversi ekuivalen IDR
                rev_idr = rev * usd_to_idr if (rev is not None and financial_currency == 'USD') else rev
                net_inc_idr = net_inc * usd_to_idr if (net_inc is not None and financial_currency == 'USD') else net_inc
                assets_idr = assets * usd_to_idr if (assets is not None and financial_currency == 'USD') else assets
                equity_idr = equity * usd_to_idr if (equity is not None and financial_currency == 'USD') else equity
                liab_idr = liab * usd_to_idr if (liab is not None and financial_currency == 'USD') else liab
                cash_idr = cash * usd_to_idr if (cash is not None and financial_currency == 'USD') else cash

                # Nilai Triliun untuk visualisasi Bar Chart
                rev_t = round(rev_idr / 1e12, 2) if rev_idr is not None else 0
                net_inc_t = round(net_inc_idr / 1e12, 2) if net_inc_idr is not None else 0

                # Nilai asli dalam Juta (M) untuk satuan pelaporan aslinya
                rev_orig_m = round(rev / 1e6, 2) if (rev is not None and financial_currency == 'USD') else (round(rev / 1e12, 2) if rev else 0)
                net_inc_orig_m = round(net_inc / 1e6, 2) if (net_inc is not None and financial_currency == 'USD') else (round(net_inc / 1e12, 2) if net_inc else 0)

                annual_items.append({
                    "period": year_label,
                    "label": f"{date_str[:4]} (Audit)",
                    "date": date_str,
                    "currency": financial_currency,
                    "revenue": rev,
                    "netIncome": net_inc,
                    "revenueIdr": rev_idr,
                    "netIncomeIdr": net_inc_idr,
                    "revenueT": rev_t,
                    "netIncomeT": net_inc_t,
                    "revenueOriginalM": rev_orig_m,
                    "netIncomeOriginalM": net_inc_orig_m,
                    "totalAssets": assets,
                    "totalEquity": equity,
                    "totalLiabilities": liab,
                    "cashEquivalents": cash,
                    "totalAssetsIdr": assets_idr,
                    "totalEquityIdr": equity_idr,
                    "totalLiabilitiesIdr": liab_idr,
                    "cashEquivalentsIdr": cash_idr,
                    "netProfitMargin": npm,
                    "roe": roe,
                    "roa": roa,
                    "der": der,
                    "eps": formatted_eps,
                    "epsIdr": eps_idr,
                })

        # 2. Quarterly Financials & Balance Sheet
        q_fin = ticker.quarterly_financials
        q_bs = ticker.quarterly_balance_sheet

        quarterly_items = []
        if q_fin is not None and not q_fin.empty:
            q_cols = [col for col in q_fin.columns]
            # Ambil maksimal 4 kuartal terbaru kronologis
            q_cols = sorted(q_cols)[:4] if len(q_cols) <= 4 else sorted(q_cols)[-4:]

            for col in q_cols:
                date_str = str(col)[:10]
                month = int(date_str[5:7])
                quarter_num = (month - 1) // 3 + 1
                q_label = f"Q{quarter_num} {date_str[:4]}"

                rev = safe_float(q_fin.loc['Total Revenue', col]) if 'Total Revenue' in q_fin.index else None
                net_inc = None
                for ni_key in ['Net Income Common Stockholders', 'Net Income']:
                    if ni_key in q_fin.index:
                        net_inc = safe_float(q_fin.loc[ni_key, col])
                        if net_inc is not None:
                            break

                assets = safe_float(q_bs.loc['Total Assets', col]) if q_bs is not None and 'Total Assets' in q_bs.index else None
                equity = None
                if q_bs is not None:
                    for eq_key in ['Stockholders Equity', 'Common Stock Equity']:
                        if eq_key in q_bs.index:
                            equity = safe_float(q_bs.loc[eq_key, col])
                            if equity is not None:
                                break

                liab = safe_float(q_bs.loc['Total Liabilities Net Minority Interest', col]) if q_bs is not None and 'Total Liabilities Net Minority Interest' in q_bs.index else None
                if liab is None and assets is not None and equity is not None:
                    liab = max(0.0, assets - equity)

                cash = safe_float(q_bs.loc['Cash And Cash Equivalents', col]) if q_bs is not None and 'Cash And Cash Equivalents' in q_bs.index else None
                eps = safe_float(q_fin.loc['Diluted EPS', col]) if 'Diluted EPS' in q_fin.index else None
                if eps is None and 'Basic EPS' in q_fin.index:
                    eps = safe_float(q_fin.loc['Basic EPS', col])
                if eps is None and net_inc is not None:
                    for sh_key in ['Diluted Average Shares', 'Basic Average Shares']:
                        if sh_key in q_fin.index:
                            sh_val = safe_float(q_fin.loc[sh_key, col])
                            if sh_val and sh_val > 0:
                                eps = net_inc / sh_val
                                break

                formatted_eps = None
                eps_idr = None
                if eps is not None:
                    if financial_currency == 'USD':
                        formatted_eps = round(eps, 4) if abs(eps) < 1 else round(eps, 2)
                        eps_idr = round(eps * usd_to_idr, 2)
                    else:
                        formatted_eps = round(eps, 2)
                        eps_idr = formatted_eps

                npm = round((net_inc / rev * 100), 2) if (rev and net_inc is not None and rev > 0) else None
                roe = round((net_inc * 4 / equity * 100), 2) if (equity and net_inc is not None and equity > 0) else None
                roa = round((net_inc * 4 / assets * 100), 2) if (assets and net_inc is not None and assets > 0) else None
                der = round((liab / equity), 2) if (equity and liab is not None and equity > 0) else None

                rev_idr = rev * usd_to_idr if (rev is not None and financial_currency == 'USD') else rev
                net_inc_idr = net_inc * usd_to_idr if (net_inc is not None and financial_currency == 'USD') else net_inc
                assets_idr = assets * usd_to_idr if (assets is not None and financial_currency == 'USD') else assets
                equity_idr = equity * usd_to_idr if (equity is not None and financial_currency == 'USD') else equity
                liab_idr = liab * usd_to_idr if (liab is not None and financial_currency == 'USD') else liab
                cash_idr = cash * usd_to_idr if (cash is not None and financial_currency == 'USD') else cash

                rev_t = round(rev_idr / 1e12, 2) if rev_idr is not None else 0
                net_inc_t = round(net_inc_idr / 1e12, 2) if net_inc_idr is not None else 0

                rev_orig_m = round(rev / 1e6, 2) if (rev is not None and financial_currency == 'USD') else (round(rev / 1e12, 2) if rev else 0)
                net_inc_orig_m = round(net_inc / 1e6, 2) if (net_inc is not None and financial_currency == 'USD') else (round(net_inc / 1e12, 2) if net_inc else 0)

                quarterly_items.append({
                    "period": q_label,
                    "label": q_label,
                    "date": date_str,
                    "currency": financial_currency,
                    "revenue": rev,
                    "netIncome": net_inc,
                    "revenueIdr": rev_idr,
                    "netIncomeIdr": net_inc_idr,
                    "revenueT": rev_t,
                    "netIncomeT": net_inc_t,
                    "revenueOriginalM": rev_orig_m,
                    "netIncomeOriginalM": net_inc_orig_m,
                    "totalAssets": assets,
                    "totalEquity": equity,
                    "totalLiabilities": liab,
                    "cashEquivalents": cash,
                    "totalAssetsIdr": assets_idr,
                    "totalEquityIdr": equity_idr,
                    "totalLiabilitiesIdr": liab_idr,
                    "cashEquivalentsIdr": cash_idr,
                    "netProfitMargin": npm,
                    "roe": roe,
                    "roa": roa,
                    "der": der,
                    "eps": formatted_eps,
                    "epsIdr": eps_idr,
                })

        # 3. Construct TTM (Trailing Twelve Months) Item from 100% Real Disclosures
        ttm_item = None
        try:
            info = ticker.info or {}

            # TTM Revenue: prefer info.get('totalRevenue'), fallback to sum of last 4 quarters
            ttm_rev = safe_float(info.get('totalRevenue'))
            if ttm_rev is None and quarterly_items:
                q_revs = [q['revenue'] for q in quarterly_items if q.get('revenue') is not None]
                if q_revs:
                    ttm_rev = sum(q_revs)

            # TTM Net Income: prefer info.get('netIncomeToCommon'), fallback to sum of last 4 quarters
            ttm_net_inc = safe_float(info.get('netIncomeToCommon'))
            if ttm_net_inc is None and quarterly_items:
                q_nets = [q['netIncome'] for q in quarterly_items if q.get('netIncome') is not None]
                if q_nets:
                    ttm_net_inc = sum(q_nets)

            # Latest balance sheet snapshot (most recent reported quarter)
            latest_q = quarterly_items[-1] if quarterly_items else (annual_items[-1] if annual_items else {})
            ttm_assets = latest_q.get('totalAssets')
            ttm_equity = latest_q.get('totalEquity')
            ttm_liab = latest_q.get('totalLiabilities')
            ttm_cash = latest_q.get('cashEquivalents')

            # Trailing EPS
            ttm_eps_raw = safe_float(info.get('trailingEps'))
            if ttm_eps_raw is None and quarterly_items:
                q_eps_list = [q['eps'] for q in quarterly_items if q.get('eps') is not None]
                if q_eps_list:
                    ttm_eps_raw = sum(q_eps_list)

            ttm_eps = None
            ttm_eps_idr = None
            if ttm_eps_raw is not None:
                if financial_currency == 'USD':
                    ttm_eps = round(ttm_eps_raw, 4) if abs(ttm_eps_raw) < 1 else round(ttm_eps_raw, 2)
                    ttm_eps_idr = round(ttm_eps_raw * usd_to_idr, 2)
                else:
                    ttm_eps = round(ttm_eps_raw, 2)
                    ttm_eps_idr = ttm_eps

            ttm_npm = round((ttm_net_inc / ttm_rev * 100), 2) if (ttm_rev and ttm_net_inc is not None and ttm_rev > 0) else None
            ttm_roe = round((ttm_net_inc / ttm_equity * 100), 2) if (ttm_equity and ttm_net_inc is not None and ttm_equity > 0) else None
            info_roa = safe_float(info.get('returnOnAssets'))
            ttm_roa = round((ttm_net_inc / ttm_assets * 100), 2) if (ttm_assets and ttm_net_inc is not None and ttm_assets > 0) else (round(info_roa * 100, 2) if info_roa is not None else None)
            ttm_der = round((ttm_liab / ttm_equity), 2) if (ttm_equity and ttm_liab is not None and ttm_equity > 0) else None

            ttm_rev_idr = ttm_rev * usd_to_idr if (ttm_rev is not None and financial_currency == 'USD') else ttm_rev
            ttm_net_inc_idr = ttm_net_inc * usd_to_idr if (ttm_net_inc is not None and financial_currency == 'USD') else ttm_net_inc
            ttm_assets_idr = ttm_assets * usd_to_idr if (ttm_assets is not None and financial_currency == 'USD') else ttm_assets
            ttm_equity_idr = ttm_equity * usd_to_idr if (ttm_equity is not None and financial_currency == 'USD') else ttm_equity
            ttm_liab_idr = ttm_liab * usd_to_idr if (ttm_liab is not None and financial_currency == 'USD') else ttm_liab
            ttm_cash_idr = ttm_cash * usd_to_idr if (ttm_cash is not None and financial_currency == 'USD') else ttm_cash

            ttm_rev_t = round(ttm_rev_idr / 1e12, 2) if ttm_rev_idr is not None else 0
            ttm_net_inc_t = round(ttm_net_inc_idr / 1e12, 2) if ttm_net_inc_idr is not None else 0
            ttm_rev_orig_m = round(ttm_rev / 1e6, 2) if (ttm_rev is not None and financial_currency == 'USD') else (round(ttm_rev / 1e12, 2) if ttm_rev else 0)
            ttm_net_inc_orig_m = round(ttm_net_inc / 1e6, 2) if (ttm_net_inc is not None and financial_currency == 'USD') else (round(ttm_net_inc / 1e12, 2) if ttm_net_inc else 0)

            if ttm_rev is not None:
                ttm_item = {
                    "period": "TTM",
                    "label": "TTM (12 Bulan)",
                    "isTTM": True,
                    "date": latest_q.get('date', 'TTM'),
                    "currency": financial_currency,
                    "revenue": ttm_rev,
                    "netIncome": ttm_net_inc,
                    "revenueIdr": ttm_rev_idr,
                    "netIncomeIdr": ttm_net_inc_idr,
                    "revenueT": ttm_rev_t,
                    "netIncomeT": ttm_net_inc_t,
                    "revenueOriginalM": ttm_rev_orig_m,
                    "netIncomeOriginalM": ttm_net_inc_orig_m,
                    "totalAssets": ttm_assets,
                    "totalEquity": ttm_equity,
                    "totalLiabilities": ttm_liab,
                    "cashEquivalents": ttm_cash,
                    "totalAssetsIdr": ttm_assets_idr,
                    "totalEquityIdr": ttm_equity_idr,
                    "totalLiabilitiesIdr": ttm_liab_idr,
                    "cashEquivalentsIdr": ttm_cash_idr,
                    "netProfitMargin": ttm_npm,
                    "roe": ttm_roe,
                    "roa": ttm_roa,
                    "der": ttm_der,
                    "eps": ttm_eps,
                    "epsIdr": ttm_eps_idr,
                }
        except Exception:
            pass

        # 4. Live Key Statistics & Market Summary from yfinance (100% Real API)
        key_stats = {}
        try:
            info = ticker.info or {}

            # Format ex-dividend date
            ex_div = None
            ex_div_ts = info.get('exDividendDate')
            if ex_div_ts:
                try:
                    import datetime
                    ex_div = datetime.datetime.fromtimestamp(ex_div_ts).strftime('%b %d, %Y')
                except Exception:
                    pass

            # Format earnings date
            earnings_date_str = None
            try:
                import datetime
                cal = getattr(ticker, 'calendar', None)
                if isinstance(cal, dict) and 'Earnings Date' in cal and cal['Earnings Date']:
                    e_dates = cal['Earnings Date']
                    if isinstance(e_dates, list) and len(e_dates) > 0:
                        if len(e_dates) > 1:
                            d1 = e_dates[0].strftime('%b %d') if isinstance(e_dates[0], datetime.date) else str(e_dates[0])
                            d2 = e_dates[1].strftime('%b %d, %Y') if isinstance(e_dates[1], datetime.date) else str(e_dates[1])
                            earnings_date_str = f"{d1} - {d2}"
                        else:
                            earnings_date_str = e_dates[0].strftime('%b %d, %Y') if isinstance(e_dates[0], datetime.date) else str(e_dates[0])
                elif info.get('earningsTimestamp'):
                    earnings_date_str = datetime.datetime.fromtimestamp(info.get('earningsTimestamp')).strftime('%b %d, %Y')
            except Exception:
                pass

            prev_close = safe_float(info.get('previousClose') or info.get('regularMarketPreviousClose'))
            open_price = safe_float(info.get('open') or info.get('regularMarketOpen'))
            bid_price = safe_float(info.get('bid'))
            ask_price = safe_float(info.get('ask'))
            bid_size = safe_float(info.get('bidSize'))
            ask_size = safe_float(info.get('askSize'))

            day_low = safe_float(info.get('dayLow') or info.get('regularMarketDayLow'))
            day_high = safe_float(info.get('dayHigh') or info.get('regularMarketDayHigh'))
            fifty_two_low = safe_float(info.get('fiftyTwoWeekLow'))
            fifty_two_high = safe_float(info.get('fiftyTwoWeekHigh'))
            vol = safe_float(info.get('volume') or info.get('regularMarketVolume'))
            avg_vol = safe_float(info.get('averageVolume') or info.get('averageVolume10days'))

            market_cap = safe_float(info.get('marketCap'))
            beta = safe_float(info.get('beta'))
            pe_ratio = safe_float(info.get('trailingPE'))
            forward_pe = safe_float(info.get('forwardPE'))
            pbv_ratio = safe_float(info.get('priceToBook'))
            eps = safe_float(info.get('trailingEps'))
            info_roa_stat = safe_float(info.get('returnOnAssets'))
            roa_stat = round(info_roa_stat * 100, 2) if info_roa_stat is not None else None

            div_rate = safe_float(info.get('dividendRate'))
            div_yield = safe_float(info.get('dividendYield'))
            target_est = safe_float(info.get('targetMeanPrice'))

            key_stats = {
                "marketCap": market_cap,
                "peRatio": pe_ratio,
                "forwardPE": forward_pe,
                "pbvRatio": pbv_ratio,
                "dividendYield": div_yield,
                "dividendRate": div_rate,
                "eps": eps,
                "roa": roa_stat,
                "beta": beta,
                "sector": info.get('sector'),
                "industry": info.get('industry'),
                "companyName": info.get('longName') or info.get('shortName'),
                "currency": info.get('currency', 'IDR'),
                "financialCurrency": financial_currency,
                "usdToIdrRate": round(usd_to_idr, 2),
                "previousClose": prev_close,
                "open": open_price,
                "bid": bid_price,
                "ask": ask_price,
                "bidSize": bid_size,
                "askSize": ask_size,
                "dayLow": day_low,
                "dayHigh": day_high,
                "fiftyTwoWeekLow": fifty_two_low,
                "fiftyTwoWeekHigh": fifty_two_high,
                "volume": vol,
                "averageVolume": avg_vol,
                "earningsDate": earnings_date_str,
                "exDividendDate": ex_div,
                "targetMeanPrice": target_est,
            }
        except Exception:
            pass

        output = {
            "success": True,
            "symbol": raw_symbol,
            "source": "Yahoo Finance (Official Disclosures)",
            "financialCurrency": financial_currency,
            "usdToIdrRate": round(usd_to_idr, 2),
            "keyStatistics": key_stats,
            "annual": annual_items,
            "quarterly": quarterly_items,
            "ttm": ttm_item,
        }
        print(json.dumps(output))

    except Exception as e:
        print(json.dumps({"success": False, "message": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()

