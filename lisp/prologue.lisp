(setg do
	(macro (*exprs)
		(cons
			(cons 'func
			(cons '()
				  *exprs
			))
		)
	)
)

(setg apply
	(func (a-func args)
		(eval (cons a-func args))
	))

(setg null-or-empty-list?
	(func (a-list)
		(or (null? a-list)
			(and
				(and
					(cons? a-list)
					(null? (car a-list))
				)
				(null? (cdr a-list))
			)
		)
	))

(setg condf
	(func (conds)
		(if (null? conds)
			throwNoCondHitError)
		
		(setl currCond (car conds))
		(setl currCond-cond (car currCond))
		(setl currCond-res (car (cdr currCond)))
		
		(if (currCond-cond)
			(currCond-res)
			(condf (cdr conds))
		)
	)
)
(do
	(setg cond-int
		(func (clauses)
			(if (null-or-empty-list? clauses)
				(list 'throwNoConditionEvaluatedTrue)
				(do
					(setl curr-clause (car clauses))
					(list
						'if (car curr-clause)
							(car (cdr curr-clause))
							(cond-int (cdr clauses))
					)
				)
			)
		))
	(setg cond
		(macro (*clauses)
			(cond-int *clauses)
		))
)


(setg condf-test (func (x)
	(condf
		(list
			(list (func () (< x 5)) (func () (list x 'lessthan5)))
			(list (func () (> x 5)) (func () (list x 'morethan5)))
			(list (func () true) (func () (list x 'equals5)))
		)
	)
))

(setg not (func (x)
	(if x
		false
		true
	)
))

(setg and (macro (a b)
	(list
		'if a
			b
			false
	)
))

(setg or (macro (a b)
	(list
		'if a
			true
			b
	)
))

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

(setg first-proper-prime-factor
	(func (n)
		(setl sqrt-n (sqrt-ceil n))
		(first-or-null
			(num-seq 2 (+ 1 sqrt-n))
			(func (d) (eq (mod n d) 0)))
	)
)

(setg prime-factors
	(do
		(func (n)
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

(setg list
	(func (*values)
		*values
	)
)

(setg push
	(func (a-list elt)
		(if (null? a-list)
			(cons elt)
			(cons 	(car a-list)
					(push (cdr a-list) elt))
		)
	)
)

(setg eq
	(func (a b)
		(cond
			((not (sym= (jstypeof a) (jstypeof b)))
				false)
			((and (record? a) (record? b))
				(record= a b))
			((cons? a)
				(listeq a b))
			((sym? a)
				(sym= a b))
			(true
				(js= a b))
		)
	)
)

(setg listeq
	(func (a b) 
		(if (eq (car a) (car b))
			(if(eq (cdr a) null)
				(eq (cdr b) null)
				(if (eq (cdr b) null)
					false
					(listeq (cdr a) (cdr b))
				)
			)
			false
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

(setg filter (func (elts pred)
		(if (null-or-empty-list? elts)
			'()
		(do
			(setl curr-elt (car elts))
			(setl get-rest (func ()
				(filter (cdr elts) pred)
			))
			(if (pred curr-elt)
				(cons curr-elt (get-rest))
				(get-rest)
			)
		))
	)
)

(setg map (func (elts map-func)
	(if (null-or-empty-list? elts)
		'()
	(cons
		(map-func (car elts))
		(map (cdr elts) map-func)
	))
))

(setg first-or-null
	(func (elts filter-func)
		(if (null-or-empty-list? elts)
			null
		(do
			(setl head (car elts))
			(if (filter-func head)
				head
				(first-or-null
					(cdr elts)
					filter-func))
		))
	)
)

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

(setg eval-debug
	(macro (expr)
		(list
			'list
			(list 'quot expr)
			'(quot =)
			expr
		)
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

(do
  	(setl it-is-oo-time true)

	(setg record?
		(func (rec)
			(and
				(and
					(cons? rec)
					(sym? (car rec))
				)
				(sym= (car rec) 'record)
			)
		))


	(setg new
		(func (type-name *rest)
			(if (not (type-exists type-name))
				throwTypeDoesNotExistException)

			(setl rec (new-record-internal type-name '()))

			(setl optional-field-values (car *rest))

			(if (not (null? optional-field-values))
				(with-values rec optional-field-values)
				rec
			)
		)
	)

	(setl new-record-internal
		(func (type-name fields)
			(list
				'record
				type-name
				fields
			)
		))

	(setl get-record-type-name
		(func (rec)
			(car (cdr rec))
		))

	(setg get-type-name
		(func (obj)
			(setl jstype (jstypeof obj))

			(cond
				((record? obj)
					(get-record-type-name obj))
				((null? obj) 'null)
				((sym= jstype 'number) 			'number)
				((sym= jstype 'LispExpression) 	'list)
				((sym= jstype 'LispSymbol) 		'symbol)
				((sym= jstype 'boolean) 		'bool)
				((sym= jstype 'LispMacro) 		'macro)
				((sym= jstype 'LispKeyword) 	'keyword)
				((sym= jstype 'LispFunction) 	'func)
				((sym= jstype 'string) 			'string)
				(true throwObjectNotOfRecognisedTypeException)
			)
		))

	(setl get-fields
		(func (rec)
			(if (not (record? rec))
				throwNotARecordException)

			(car (cdr (cdr rec)))
		))
			
	(setg get-type
		(func (type-name)
			(setl the-type
				(first-or-null
					types
					(func (type-rec)
						(eq (get-value type-rec 'name)
							type-name))
				))
			the-type
		))

	(setg type-exists
		(func (type-name)
			(setl the-type (get-type type-name))
			(not (null? the-type))
		))

	(setg type-of
		(func (rec)
			(setl type-name (get-type-name rec))
			(setl rec-type (get-type type-name))

			(if (null? rec-type)
				throwCouldntFindTypeForRecord)
			rec-type
		))

	(setg get-type-fields
		(func (type)
			(setl type-fields (get-value type 'fields))
			(map type-fields
				(func (field)
					(list
						(get-value field 'type)
						(get-value field 'name)
					)
				)
			)
		))

	(setg is-a
		(func (rec type-name)
			(setl rec-type-name (get-type-name rec))
			(sym= rec-type-name type-name)
		))

	(setg get-value
		(func (rec field-name)
			(setl field (get-field rec field-name))
			(car (cdr (cdr field)))
		))

	(setl get-field
		(func (rec field-name)
			(setl field-values (get-fields rec))
			(setl fields-partition
				(partition field-values (is-child-called field-name)))
			(setl ret (car (car fields-partition)))
			
			(if (null? ret)
				throwCouldntGetValueException)

			ret
		))
	
	(setl partition (func (a-list set1-predicate)
		(setl set2-predicate
			(func (elt) (not (set1-predicate elt))))

		(setl set1
			(filter a-list set1-predicate))
		(setl set2
			(filter a-list set2-predicate))

		(list set1 set2)
	))

	(setl is-child-called
		(func(child-name)
			(func (elt)
				(and
					(and 	(cons? elt)
						 	(sym? (car elt)))
							(sym= (car elt) child-name))
			)
		)
	)

	(setg new-type
		(func (type-name *fields)
			(new-record-internal
				'type
				(list
				 	(list 'name 'symbol type-name)
					(list 'fields 'list *fields)
				)
			)
		))

	(setg new-field
		(func (field-name field-type)
			(new-record-internal
				'field
				(list
					(list 'name 'symbol field-name)
					(list 'type 'symbol field-type)
				)
			)
		))

	(setl type-of-type
		(new-type
			'type
			(new-field 'name 'symbol)
			(new-field 'fields 'list)
		))

	(setl type-of-field
		(new-type
			'field
			(new-field 'name 'symbol)
			(new-field 'type 'symbol)
		))

	(setg types
		(list
			type-of-type
			type-of-field

			(new-type 'number	'())
			(new-type 'list		'())
			(new-type 'symbol	'())
			(new-type 'bool		'())
			(new-type 'null		'())
			(new-type 'macro	'())
			(new-type 'keyword	'())
			(new-type 'func		'())
			(new-type 'string	'())
		)
	)
	(setg with-values
		(do
			(setl with-value
				(func (rec field)
					(if (not (record? rec))
						throwNotARecordException)

					(setl field-name (car field))
					(setl field-type (car (cdr field)))
					(setl field-value (car (cdr (cdr field))))
					
					(if (not (null? (cdr (cdr (cdr field)))))
						throwTooManyValuesInFieldException)
					(if (not (sym? field-name))
						throwFirstElementInFieldMustBeSymbolForFieldName)
					(if (not (sym? field-type))
						throwSecondElementInFieldMustBeSymbolForTypeName)

					(setl record-fields (get-fields rec))
					(setl type-name (get-type-name rec))
					
					(setl fields-partition
						(partition
							record-fields
							(is-child-called field-name)))

					(setl unmodified-fields
						(car (cdr fields-partition)))
					
					(setl
						new-record-fields
						 (cons field unmodified-fields))
					
					(new-record-internal
						type-name
						new-record-fields)
				)
			)

		  	(func (rec field-values)
				(if (null? field-values)
					rec
				(do
					(setl rec-one-changed
						(with-value rec (car field-values)))

				  	(with-values
						rec-one-changed
						(cdr field-values))
				))
			)
		)
	)
)


