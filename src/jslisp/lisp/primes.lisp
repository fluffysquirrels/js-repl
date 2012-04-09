(setg first-proper-prime-factor
	(fn (n)
		(setl sqrt-n (sqrt-ceil n))
		(first-or-null
			(num-seq 2 (+ 1 sqrt-n))
			(fn (d) (eq (mod n d) 0)))
	)
)

(setg prime-factors
	(do
		(fn (n)
			(if (= n 1)
				(cons)
			(do
				(setl first-factor (first-proper-prime-factor n))

				(if (null? first-factor)
					(cons n)
					(cons
						first-factor
						(prime-factors (/ n first-factor))
					)
				)
			))
		)
	)
)

