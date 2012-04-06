(do
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
		(macro (type-name *field-value-clauses)
			(list
				'new-with-values-list
				type-name
				(get-macro-value-list-from-value-clauses
				  *field-value-clauses)
			)
		))

	(setg new-with-values-list
		(func (type-name *rest)
			(if (not (type-exists type-name))
				throwTypeDoesNotExistException)

			(setl rec (new-record-internal type-name (dict.new)))

			(setl optional-field-values (car *rest))

			(if (not (null? optional-field-values))
				(with-values-list rec optional-field-values)
				rec
			)
		)
	)

	(setl new-record-internal
		(func (type-name fields)
			(if (not (dict.is? fields))
				throw-fieldsMustBeADict)
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
				((dict.is? obj)					'dict)
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
			
	(setg type-of
		(func (rec)
			(setl type-name (get-type-name rec))
			
			(get-type type-name)
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
			(setl field-values (get-fields rec))
			(dict.get field-values field-name)
		))

	(setg new-type
		(func (type-name *fields)
			(setl fields-kv (map *fields convert-field-to-kv))
			(setl fields-dict (dict.from-list fields-kv))

			(new-record-internal
				'type
				(dict.from-list
				  	(list
				 		(list 'name type-name)
						(list 'fields fields-dict)
					)
				)
			)
		))

	(setl convert-field-to-kv
		(func (curr-field)
			(if (not
				(sym=
					(get-type-name curr-field)
					'field))
				throw-cannotAddFieldThatIsNotAField)
			(list
				(get-value curr-field 'name)
				curr-field
			)
		))

	(setg new-field
		(func (field-name field-type)
			(new-record-internal
				'field
				(dict.from-list
					(list
						(list 'name field-name)
						(list 'type field-type)
					)
				)
			)
		))

	(setl type-of-type
		(new-type
			'type
			(new-field 'name 'symbol)
			(new-field 'fields 'dict)
		))

	(setl type-of-field
		(new-type
			'field
			(new-field 'name 'symbol)
			(new-field 'type 'symbol)
		))

	(setl convert-type-to-kv
		(func (curr-type)
			(if (not
				(sym=
					(get-type-name curr-type)
					'type))
				throw-cannotAddTypeThatIsNotAType)
			(list
				(get-value curr-type 'name)
				curr-type
			)
		))

	(setg get-type
		(func (type-name)
			(dict.get types type-name)
		))

	(setg tryget-type
		(func (type-name)
			(dict.tryget types type-name)
		))

	(setg add-type
		(func (*new-types)
			(setg types
				(dict.with-values
					types
					(map *new-types convert-type-to-kv)
				))
		))

	(setg type-exists
		(func (type-name)
			(dict.has? types type-name)
		))

	(setg types (dict.new))

	(add-type
		type-of-type
		type-of-field

		(new-type 'number	)
		(new-type 'list		)
		(new-type 'symbol	)
		(new-type 'bool		)
		(new-type 'null		)
		(new-type 'macro	)
		(new-type 'keyword	)
		(new-type 'func		)
		(new-type 'string	)
	)

	(do
	    (setg with-values
			(macro (rec *field-value-clauses)
				(list
					'with-values-list
					rec
					(get-macro-value-list-from-value-clauses
					  *field-value-clauses)
				)
			))
	  	(setg with-values-list (func (rec field-values)
			(cond
				((null-or-empty-list? field-values)
					rec)
				(true (do
					(setl rec-one-changed
						(with-value rec (car field-values)))

				  	(with-values-list
						rec-one-changed
						(cdr field-values))
				))
			)
		))

		(setl with-value
			(func (rec field)
				(if (not (record? rec))
					throwNotARecordException)

				(setl field-name (car field))
				(setl field-value (second field))
				
				(if (not (null? (cdr (cdr field))))
					throw-tooManyValuesInFieldException)
				(if (not (sym? field-name))
					throw-firstElementInFieldMustBeSymbolForFieldName)

				(setl record-fields (get-fields rec))
				(setl type-name (get-type-name rec))
				(setl rec-type (type-of rec))

				(setl type-fields (get-value rec-type 'fields))
				(setl type-field  (dict.get type-fields field-name))
				(if (not (sym=
						   (get-type-name field-value)
						   (get-value type-field 'type)
					))
					throw-valueTypeNameDoesNotMuchFieldTypeName
				)

				(setl new-record-fields
					(dict.with-value
					    record-fields
						field-name
						field-value))
				
				(new-record-internal
					type-name
					new-record-fields)
			)
		)
	)
)
