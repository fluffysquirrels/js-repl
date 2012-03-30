
(setg divrem
	(func (a b)
		(setl divrem-internal
			(func 	(a
					curr-divisor
					curr-divisor-multiplier)
				(if (< a curr-divisor)
					(list 0 a)
				(do
					(setl result-from-larger-divisors
						(divrem-internal
							a
							(+ curr-divisor curr-divisor)
							(+ curr-divisor-multiplier curr-divisor-multiplier)))
					(setl remaining-dividend (car (cdr result-from-larger-divisors)))
					(setl curr-quotient (car result-from-larger-divisors))

					(if (< remaining-dividend curr-divisor)
						(list curr-quotient remaining-dividend)
						(list
							(+ 	curr-quotient
								curr-divisor-multiplier)
							(-	remaining-dividend
								curr-divisor))
					)

				))
			)
		)

		(divrem-internal a b 1)
	)
)

(setg mod
	(func (a b)
		(setl divrem-result (divrem a b))
		(car (cdr divrem-result))
	)
)


(setg sqrt-ceil (func (n)
	(setl is-pos-and-square-greater-than-n
		(func (x)
			(and
				(>= x 0)
				(>= (* x x) n)
			)
		)
	)
	(int-range-infimum is-pos-and-square-greater-than-n)
))

(setg int-range-infimum
	(func (predicate)
		(setl init-max-range (int-pow-2 24))
		(setl init-min-range (- 0 init-max-range))

		(setl find-infimum
			(func (min-range max-range)
				(if (predicate min-range)
					(throwMinPassedPredicate))
				(if (not (predicate max-range))
					(throwMaxNotPassedPredicate))
				
				(setl len-range (- max-range min-range))

				(if (< len-range 1)
					(throwRangeLengthLessThanOne))
				(if (= len-range 1)
					max-range
					(do
						(setl mid-range
							(+ min-range (/ len-range 2)))
						(if (predicate mid-range)
							(find-infimum
								min-range mid-range)
							(find-infimum
								mid-range max-range)
						)
					)
				)
			)
		)

		(find-infimum init-min-range init-max-range)
	)
)

(setg int-pow-2
	(func (n)
		(if (<= n 0)
			1
			(* 2 (int-pow-2 (- n 1)))
		)
	)
)


(setg num-seq
	(func (min upper-bound)
		(if (>= min upper-bound)
			'()
			(cons
				min
				(num-seq
					(+ min 1)
					upper-bound
				)
			)
		)
))

(setg num-odd? (func (n)
	(setl mod2 (mod n 2))
	(= mod2 1)
))
	
(setg num-even? (func (n)
	(setl mod2 (mod n 2))
	(= mod2 0)
))

(setg sum-ints (func (x)
	(if (= x 1)
		1
	(+ x (sum-ints (- x 1))))
))

(setg num-cmp (func (x y)
	(if (= x y)
		0
	(if (> x y)
		1
	(if (< x y)
		-1
		throwError)
))))

