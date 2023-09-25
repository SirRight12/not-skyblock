function calculateDamage(dmg=1,str=1,cd=1,bm=0,pm=0) {
    let damage = (5 + dmg) * (1 + (str / 100)) * (1 + (cd / 100)) * (1 + (bm / 100)) * (1 + (pm / 100))
    damage = Math.floor(damage * 10) / 10
    return damage
}
function dmgToString(dmg) {
    const dmgStr = dmg.toLocaleString()
    return dmgStr
}
calculateDamage(10000,15000000000,10000000000000)