export default formatCoin = (coin) => {
    if(isNaN(coin)){
        return 'NaN';
    }
    let s = coin.toString()
    let i = s.length % 3;
    if(i == 0){
        i = 3;
    }
    let formatCoin = ''
    let j = 0;
    while(i <= s.length){
        if(i == s.length){
            formatCoin += s.slice(j,i);
        }else{
            formatCoin += s.slice(j,i) + '.';
        }
        j = i;
        i += 3;
    }
    return formatCoin;
}