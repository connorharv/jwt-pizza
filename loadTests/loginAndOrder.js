import { sleep, check, group, fail } from 'k6'
import http from 'k6/http'
import jsonpath from 'https://jslib.k6.io/jsonpath/1.0.2/index.js'

export const options = {
    cloud: {
        distribution: { 'amazon:us:ashburn': { loadZone: 'amazon:us:ashburn', percent: 100 } },
        apm: [],
    },
    thresholds: {},
    scenarios: {
        Scenario_1: {
            executor: 'ramping-vus',
            gracefulStop: '30s',
            stages: [
                { target: 5, duration: '30s' },
                { target: 15, duration: '1m' },
                { target: 10, duration: '30s' },
                { target: 0, duration: '30s' },
            ],
            gracefulRampDown: '30s',
            exec: 'scenario_1',
        },
    },
}

export function scenario_1() {
    let response

    const vars = {}

    // Login
    response = http.put(
        'https://pizza-service.connor329.click/api/auth',
        '{"email":"d@jwt.com","password":"diner"}',
        {
            headers: {
                accept: '*/*',
                'accept-encoding': 'gzip, deflate, br, zstd',
                'accept-language': 'es-US,es;q=0.9,en-US;q=0.8,en;q=0.7,es-419;q=0.6',
                'content-type': 'application/json',
                origin: 'https://pizza.connor329.click',
                priority: 'u=1, i',
                'sec-ch-ua': '"Google Chrome";v="153", "Not_A Brand";v="8", "Chromium";v="153"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-site',
            },
        }
    )
    if (!check(response, { 'status equals 200': (response) => response.status.toString() === '200' })) {
        console.log(response.body);
        fail('Login was *not* 200');
    }

    vars['token'] = jsonpath.query(response.json(), '$.token')[0]

    sleep(1.8)

    // Get menu
    response = http.get('https://pizza-service.connor329.click/api/order/menu', {
        headers: {
            accept: '*/*',
            'accept-encoding': 'gzip, deflate, br, zstd',
            'accept-language': 'es-US,es;q=0.9,en-US;q=0.8,en;q=0.7,es-419;q=0.6',
            authorization: `Bearer ${vars['token']}`,
            'content-type': 'application/json',
            'if-none-match': 'W/"201-eYZBDjAGktnX6WfVo9tT2zuqPXE"',
            origin: 'https://pizza.connor329.click',
            priority: 'u=1, i',
            'sec-ch-ua': '"Google Chrome";v="153", "Not_A Brand";v="8", "Chromium";v="153"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-site',
        },
    })

    // Get franchise
    response = http.get(
        'https://pizza-service.connor329.click/api/franchise?page=0&limit=20&name=*',
        {
            headers: {
                accept: '*/*',
                'accept-encoding': 'gzip, deflate, br, zstd',
                'accept-language': 'es-US,es;q=0.9,en-US;q=0.8,en;q=0.7,es-419;q=0.6',
                authorization: `Bearer ${vars['token']}`,
                'content-type': 'application/json',
                'if-none-match': 'W/"5c-d0mYspVaBg4CWLv5SwHtPczo0mI"',
                origin: 'https://pizza.connor329.click',
                priority: 'u=1, i',
                'sec-ch-ua': '"Google Chrome";v="153", "Not_A Brand";v="8", "Chromium";v="153"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-site',
            },
        }
    )
    sleep(1.7)

    response = http.get('https://pizza-service.connor329.click/api/user/me', {
        headers: {
            accept: '*/*',
            'accept-encoding': 'gzip, deflate, br, zstd',
            'accept-language': 'es-US,es;q=0.9,en-US;q=0.8,en;q=0.7,es-419;q=0.6',
            authorization: `Bearer ${vars['token']}`,
            'content-type': 'application/json',
            'if-none-match': 'W/"5d-BhrfNx1+dGQoUqbs5PiwzB/3xxc"',
            origin: 'https://pizza.connor329.click',
            priority: 'u=1, i',
            'sec-ch-ua': '"Google Chrome";v="153", "Not_A Brand";v="8", "Chromium";v="153"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-site',
        },
    })
    sleep(0.6)

    // Purchase pizza
    response = http.post(
        'https://pizza-service.connor329.click/api/order',
        '{"items":[{"menuId":11,"description":"Veggie","price":0.0038}],"storeId":"4","franchiseId":2}',
        {
            headers: {
                accept: '*/*',
                'accept-encoding': 'gzip, deflate, br, zstd',
                'accept-language': 'es-US,es;q=0.9,en-US;q=0.8,en;q=0.7,es-419;q=0.6',
                authorization: `Bearer ${vars['token']}`,
                'content-type': 'application/json',
                origin: 'https://pizza.connor329.click',
                priority: 'u=1, i',
                'sec-ch-ua': '"Google Chrome";v="153", "Not_A Brand";v="8", "Chromium";v="153"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-site',
            },
        }
    )
    sleep(1.1)

    vars['jwt'] = jsonpath.query(response.json(), '$.jwt')[0]

    // Verify pizza
    response = http.post(
        'https://pizza-factory.cs329.click/api/order/verify',
        `{"jwt": "${vars['jwt']}"}`,
        {
            headers: {
                accept: '*/*',
                'accept-encoding': 'gzip, deflate, br, zstd',
                'accept-language': 'es-US,es;q=0.9,en-US;q=0.8,en;q=0.7,es-419;q=0.6',
                authorization: `Bearer ${vars['token']}`,
                'content-type': 'application/json',
                origin: 'https://pizza.connor329.click',
                priority: 'u=1, i',
                'sec-ch-ua': '"Google Chrome";v="153", "Not_A Brand";v="8", "Chromium";v="153"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'cross-site',
                'sec-fetch-storage-access': 'active',
            },
        }
    )
}
