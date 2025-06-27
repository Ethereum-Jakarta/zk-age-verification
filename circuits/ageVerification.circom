pragma circom 2.0.0;

// Simple age verification circuit for Circom 2.x
template AgeVerification() {
    // Private inputs (these won't be revealed in proof)
    signal input birthDay;
    signal input birthMonth;
    signal input birthYear;
    signal input salt;
    
    // Public inputs (these will be revealed)
    signal input currentYear;
    signal input currentMonth;
    signal input currentDay;
    
    // Outputs
    signal output isAdult;
    signal output commitment;
    
    // Calculate age in years (simplified)
    signal yearDiff;
    yearDiff <== currentYear - birthYear;
    
    // Simple birthday check: if current month/day >= birth month/day
    signal monthPassed;
    signal dayPassed;
    
    // Month comparison (simplified)
    component monthCheck = GreaterEqThan(4);
    monthCheck.in[0] <== currentMonth;
    monthCheck.in[1] <== birthMonth;
    monthPassed <== monthCheck.out;
    
    // Day comparison (simplified) 
    component dayCheck = GreaterEqThan(5);
    dayCheck.in[0] <== currentDay;
    dayCheck.in[1] <== birthDay;
    dayPassed <== dayCheck.out;
    
    // Birthday has passed this year if month > birth_month OR (month == birth_month AND day >= birth_day)
    signal sameMonth;
    component monthEqual = IsEqual();
    monthEqual.in[0] <== currentMonth;
    monthEqual.in[1] <== birthMonth;
    sameMonth <== monthEqual.out;
    
    // Fix non-quadratic constraint by breaking into simpler operations
    signal birthdayPassed;
    signal temp1;
    signal temp2;
    
    temp1 <== sameMonth * dayPassed;
    temp2 <== monthPassed * sameMonth;
    birthdayPassed <== monthPassed + temp1 - temp2;
    
    // Calculate actual age
    signal actualAge;
    actualAge <== yearDiff - 1 + birthdayPassed;
    
    // Check if age >= 18
    component ageCheck = GreaterEqThan(7);
    ageCheck.in[0] <== actualAge;
    ageCheck.in[1] <== 18;
    isAdult <== ageCheck.out;
    
    // Simple commitment (hash-like)
    commitment <== birthDay + birthMonth * 100 + birthYear * 10000 + salt;
    
    // Range constraints
    // birthDay: 1-31
    signal dayValid1, dayValid2;
    component dayMin = GreaterEqThan(5);
    dayMin.in[0] <== birthDay;
    dayMin.in[1] <== 1;
    dayValid1 <== dayMin.out;
    
    component dayMax = LessThan(6);
    dayMax.in[0] <== birthDay;
    dayMax.in[1] <== 32;
    dayValid2 <== dayMax.out;
    
    dayValid1 === 1;
    dayValid2 === 1;
    
    // birthMonth: 1-12
    signal monthValid1, monthValid2;
    component monthMin = GreaterEqThan(4);
    monthMin.in[0] <== birthMonth;
    monthMin.in[1] <== 1;
    monthValid1 <== monthMin.out;
    
    component monthMax = LessThan(4);
    monthMax.in[0] <== birthMonth;
    monthMax.in[1] <== 13;
    monthValid2 <== monthMax.out;
    
    monthValid1 === 1;
    monthValid2 === 1;
    
    // birthYear: 1900-2010
    signal yearValid1, yearValid2;
    component yearMin = GreaterEqThan(11);
    yearMin.in[0] <== birthYear;
    yearMin.in[1] <== 1900;
    yearValid1 <== yearMin.out;
    
    component yearMax = LessThan(11);
    yearMax.in[0] <== birthYear;
    yearMax.in[1] <== 2011;
    yearValid2 <== yearMax.out;
    
    yearValid1 === 1;
    yearValid2 === 1;
}

// Greater than or equal template
template GreaterEqThan(n) {
    assert(n <= 252);
    signal input in[2];
    signal output out;
    
    component lt = LessThan(n);
    lt.in[0] <== in[1];
    lt.in[1] <== in[0] + 1;
    out <== 1 - lt.out;
}

// Less than template - FIXED
template LessThan(n) {
    assert(n <= 252);
    signal input in[2];
    signal output out;
    
    component n2b = Num2Bits(n+1);  // Need n+1 bits to check bit position n
    n2b.in <== in[0] + (1<<n) - in[1];
    out <== 1 - n2b.out[n];
}

// Number to bits template
template Num2Bits(n) {
    signal input in;
    signal output out[n];
    var lc1=0;
    
    var e2 = 1;
    for (var i = 0; i<n; i++) {
        out[i] <-- (in >> i) & 1;
        out[i] * (out[i] -1 ) === 0;
        lc1 += out[i] * e2;
        e2 = e2 + e2;
    }
    
    lc1 === in;
}

// Is equal template
template IsEqual() {
    signal input in[2];
    signal output out;
    
    component isz = IsZero();
    isz.in <== in[1] - in[0];
    out <== isz.out;
}

// Is zero template
template IsZero() {
    signal input in;
    signal output out;
    
    signal inv;
    inv <-- in!=0 ? 1/in : 0;
    out <== -in*inv +1;
    in*out === 0;
}

component main = AgeVerification();