const ConfigApi = {
    URL_BASE: (() => {
        if (window.location.protocol === 'file:') {
            return 'http://localhost:3000/api';
        }
        return '/api';
    })()
};
