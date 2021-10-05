const http = require('k6/http');
const { check, sleep } = require('k6');
const { Rate } = require('k6/metrics');

export let errorRate = new Rate('errors');

export const options = {
  // stages: [
  //   {duration: '15s', target: 1000},
  //   {duration: '30s', target: 1000},
  //   {duration: '15s', target: 0}
  //   ],
  vus: 1000,
  duration: '30s'
  // thresholds: {
  //   errors: ['rate<1']
  // },
  // scenarios: {
  // constant_request_rate: {
  //   executor: 'constant-arrival-rate',
  //   rate: 1000,
  //   timeUnit: '1s',
  //   duration: '30s',
  //   preAllocatedVUs: 500,
  //   maxVUs: 1500
  //   }
  // }
}

export default function () {

  const randomID = Math.floor(Math.random() * 1000)

  // check(http.get(`http://localhost:5000/api/related?id=${randomID}`), {
  //   'status is 200': (r) => r.status == 200,
  // }) || errorRate.add(1);
  http.get(`http://localhost:5000/api/related?id=${randomID}`);
  sleep(1);

}





  // scenarios: {
  //   constant_request_rate: {
  //     executor: 'constant-arrival-rate',
  //     rate: 500,
  //     timeUnit: '1s',
  //     duration: '60s',
  //     preAllocatedVUs: 50,
  //     maxVUs: 100
  //   }
  // }