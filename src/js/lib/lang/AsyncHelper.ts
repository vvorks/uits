import axios from 'axios';

export class AsyncHelper {
  public httpGet(url: string, param: object, timeout: number = 1000) {
    return axios.get(url, { params: param, timeout: timeout });
  }

  public httpPost(url: string, param: object, timeout: number = 1000) {
    return axios.post(url, { data: param, timeout: timeout });
  }
}
