export const unwrap = <T>(response: { data: { data: T } }): T =>
    response.data.data;
