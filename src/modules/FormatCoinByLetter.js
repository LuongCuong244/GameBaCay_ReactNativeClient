export default formatCoinByLetter = (coin) => {
    if (coin < 1000) {
        return coin;
    }
    // hàng nghìn
    if (coin < 1000000) {
        if (coin % 1000 == 0) {
            const s = (coin / 1000) + 'k';
            return s;
        } else if (coin % 100 == 0) {
            const s = (coin / 1000).toFixed(1) + 'k';
            return s;
        } else {
            const s = (coin / 1000).toFixed(2) + 'k';
            return s;
        }
    }
    // hàng triệu
    if (coin < 1000000000) {
        if (coin % 1000000 == 0) {
            const s = (coin / 1000000) + 'M';
            return s;
        } else if (coin % 100000 == 0) {
            const s = (coin / 1000000).toFixed(1) + 'M';
            return s;
        } else {
            const s = (coin / 1000000).toFixed(2) + 'M';
            return s;
        }
    }
    // hàng tỷ
    if (coin % 1000000000 == 0) {
        const s = (coin / 1000000000) + 'B';
        return s;
    } else if (coin % 10000000000 == 0) {
        const s = (coin / 10000000000).toFixed(1) + 'B';
        return s;
    } else {
        const s = (coin / 1000000000).toFixed(2) + 'B';
        return s;
    }
}