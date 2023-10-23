const validateResponse = (response) => {
    if (response.ok) return
    throw new Error('BadRequest')
}

const defaultConfig = () => {
    return {
        token: TOKEN,
        timeout: 1000,
        headers: {
            Authorization: `Bearer '${TOKEN}'`,
            'Content-Type': 'application/json',
        },
    }
}

const requester =
    (host, url, config, data) =>
    async () => {
        try {
            const fullUrl = `${host}/apps/${Config.AppId}/${url}`


            const controller = new AbortController()
            config.signal = controller.signal

            const timeout = setTimeout(() => {
                controller.abort()
            }, config.timeout)

            config.body = JSON.stringify(data)

            // console.log(fullUrl)
            // fullUrl.searchParams.append('token', token);

            // console.info('Requester: request', { fullUrl, config });

            const response = await fetch(fullUrl, config)

            clearTimeout(timeout)

            validateResponse(response)

            // console.info('Requester: response', { response });

            const json = (await response.json()) || {}

            // console.info('Requester: result', { json });
            return json
        } catch (error) {
            //
        }
    }

const handleRequest = async (
    asyncFunc,
)=> {
    try {
        return asyncFunc()
    } catch (error) {
        return {}
    }
}

const get = async (
    url,
    configs = {},
    host,
    retry = 1
) => {
    try {
        const config = {
            ...defaultConfig(),
            ...configs,
            method: 'GET',
        }

        const request = requester(host, url, config)
        return await handleRequest(request, retry)
    } catch (error) {
        console.warn(error)
        return {}
    }
}

const post = async (
    url,
    data,
    configs = {},
    host,
    retry = 1
) => {
    try {
        const config = {
            ...defaultConfig(),
            ...configs,
            method: 'POST',
        }

        const request = requester(host, url, config, data)
        return await handleRequest(request, retry)
    } catch (error) {
        
        console.warn(error)
        return {}
    }
}

