import re

file_path = "/Users/apple/Desktop/Maff.uz-main/frontend/src/app/login/page.tsx"
with open(file_path, "r") as f:
    content = f.read()

# Fix Phone Input
content = content.replace(
    '''                  {/* Phone Input */}
                  <div className="relative">
                    <Phone className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      type="text"
                      value={inputValue}
                      onChange={(e) => handlePhoneInputChange(e.target.value)}
                      placeholder="+998 90 123 45 67"
                      className="w-full bg-transparent border-b border-slate-200 py-3 pl-8 text-xs md:text-sm font-semibold text-[#2c3b6e] tracking-normal focus:outline-none focus:border-[#2c3b6e] transition-colors placeholder:text-slate-300 placeholder:uppercase placeholder:tracking-widest"
                    />
                    {inputValue && method === "phone" && !isPhoneValid(inputValue) && (
                      <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-wider">
                        Номер должен быть в формате +998 и содержать 9 цифр после кода (введено: {inputValue.replace(/[^0-9]/g, "").length}/12 цифр)
                      </p>
                    )}
                  </div>''',
    '''                  {/* Phone Input */}
                  <div>
                    <div className="flex items-center border-b border-slate-200 py-3 focus-within:border-[#2c3b6e] transition-colors">
                      <Phone className="w-4 h-4 text-slate-300 mr-3 flex-shrink-0" />
                      <input 
                        type="text"
                        value={inputValue}
                        onChange={(e) => handlePhoneInputChange(e.target.value)}
                        placeholder="+998 90 123 45 67"
                        className="w-full bg-transparent text-xs md:text-sm font-semibold text-[#2c3b6e] tracking-normal focus:outline-none placeholder:text-slate-300 placeholder:uppercase placeholder:tracking-widest"
                      />
                    </div>
                    {inputValue.replace(/[^0-9]/g, "").length > 3 && !isPhoneValid(inputValue) && (
                      <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-wider">
                        Номер должен быть в формате +998 и содержать 9 цифр после кода (введено: {inputValue.replace(/[^0-9]/g, "").length}/12 цифр)
                      </p>
                    )}
                  </div>'''
)

# Fix Password Input
content = content.replace(
    '''                  {/* Password Input */}
                  <div className="relative">
                    <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setValidationError(""); }}
                      placeholder={mode === "login" ? "ВВЕДИТЕ ПАРОЛЬ" : "ПРИДУМАЙТЕ ПАРОЛЬ"}
                      className="w-full bg-transparent border-b border-slate-200 py-3 px-8 text-xs md:text-sm font-semibold text-[#2c3b6e] tracking-normal focus:outline-none focus:border-[#2c3b6e] transition-colors placeholder:text-slate-300 placeholder:uppercase placeholder:tracking-widest"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 p-1 hover:text-[#2c3b6e] text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    {password && password.length < 8 && (
                      <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-wider">
                        Пароль должен содержать не менее 8 символов (введено: {password.length})
                      </p>
                    )}
                  </div>''',
    '''                  {/* Password Input */}
                  <div>
                    <div className="flex items-center border-b border-slate-200 py-3 focus-within:border-[#2c3b6e] transition-colors">
                      <Lock className="w-4 h-4 text-slate-300 mr-3 flex-shrink-0" />
                      <input 
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setValidationError(""); }}
                        placeholder={mode === "login" ? "ВВЕДИТЕ ПАРОЛЬ" : "ПРИДУМАЙТЕ ПАРОЛЬ"}
                        className="w-full bg-transparent text-xs md:text-sm font-semibold text-[#2c3b6e] tracking-normal focus:outline-none placeholder:text-slate-300 placeholder:uppercase placeholder:tracking-widest"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1 hover:text-[#2c3b6e] text-slate-300 transition-colors ml-2"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {password && password.length < 8 && (
                      <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-wider">
                        Пароль должен содержать не менее 8 символов (введено: {password.length})
                      </p>
                    )}
                  </div>'''
)

# Fix Confirm Password Input
content = content.replace(
    '''                  {/* Confirm Password (Register mode only) */}
                  {mode === "register" && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="relative overflow-hidden"
                    >
                      <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input 
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); setValidationError(""); }}
                        placeholder="ПОДТВЕРДИТЕ ПАРОЛЬ"
                        className="w-full bg-transparent border-b border-slate-200 py-3 px-8 text-xs md:text-sm font-semibold text-[#2c3b6e] tracking-normal focus:outline-none focus:border-[#2c3b6e] transition-colors placeholder:text-slate-300 placeholder:uppercase placeholder:tracking-widest"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 p-1 hover:text-[#2c3b6e] text-slate-300 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      {confirmPassword && password !== confirmPassword && (
                        <p className="text-[9px] text-red-400 mt-1 uppercase tracking-wider">
                          Пароли не совпадают
                        </p>
                      )}
                    </motion.div>
                  )}''',
    '''                  {/* Confirm Password (Register mode only) */}
                  {mode === "register" && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center border-b border-slate-200 py-3 focus-within:border-[#2c3b6e] transition-colors">
                        <Lock className="w-4 h-4 text-slate-300 mr-3 flex-shrink-0" />
                        <input 
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => { setConfirmPassword(e.target.value); setValidationError(""); }}
                          placeholder="ПОДТВЕРДИТЕ ПАРОЛЬ"
                          className="w-full bg-transparent text-xs md:text-sm font-semibold text-[#2c3b6e] tracking-normal focus:outline-none placeholder:text-slate-300 placeholder:uppercase placeholder:tracking-widest"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="p-1 hover:text-[#2c3b6e] text-slate-300 transition-colors ml-2"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {confirmPassword && password !== confirmPassword && (
                        <p className="text-[9px] text-red-400 mt-1 uppercase tracking-wider">
                          Пароли не совпадают
                        </p>
                      )}
                    </motion.div>
                  )}'''
)

# Fix First Name Input
content = content.replace(
    '''                  {/* First Name */}
                  <div className="relative">
                    <User className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      type="text"
                      value={firstName}
                      onChange={(e) => { setFirstName(e.target.value); setValidationError(""); }}
                      placeholder="ИМЯ"
                      className="w-full bg-transparent border-b border-slate-200 py-3 pl-8 text-xs md:text-sm font-semibold text-[#2c3b6e] tracking-normal focus:outline-none focus:border-[#2c3b6e] transition-colors placeholder:text-slate-300 placeholder:uppercase placeholder:tracking-widest"
                    />
                  </div>''',
    '''                  {/* First Name */}
                  <div className="flex items-center border-b border-slate-200 py-3 focus-within:border-[#2c3b6e] transition-colors">
                    <User className="w-4 h-4 text-slate-300 mr-3 flex-shrink-0" />
                    <input 
                      type="text"
                      value={firstName}
                      onChange={(e) => { setFirstName(e.target.value); setValidationError(""); }}
                      placeholder="ИМЯ"
                      className="w-full bg-transparent text-xs md:text-sm font-semibold text-[#2c3b6e] tracking-normal focus:outline-none placeholder:text-slate-300 placeholder:uppercase placeholder:tracking-widest"
                    />
                  </div>'''
)

# Fix Last Name Input
content = content.replace(
    '''                  {/* Last Name */}
                  <div className="relative">
                    <User className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      type="text"
                      value={lastName}
                      onChange={(e) => { setLastName(e.target.value); setValidationError(""); }}
                      placeholder="ФАМИЛИЯ"
                      className="w-full bg-transparent border-b border-slate-200 py-3 pl-8 text-xs md:text-sm font-semibold text-[#2c3b6e] tracking-normal focus:outline-none focus:border-[#2c3b6e] transition-colors placeholder:text-slate-300 placeholder:uppercase placeholder:tracking-widest"
                    />
                  </div>''',
    '''                  {/* Last Name */}
                  <div className="flex items-center border-b border-slate-200 py-3 focus-within:border-[#2c3b6e] transition-colors">
                    <User className="w-4 h-4 text-slate-300 mr-3 flex-shrink-0" />
                    <input 
                      type="text"
                      value={lastName}
                      onChange={(e) => { setLastName(e.target.value); setValidationError(""); }}
                      placeholder="ФАМИЛИЯ"
                      className="w-full bg-transparent text-xs md:text-sm font-semibold text-[#2c3b6e] tracking-normal focus:outline-none placeholder:text-slate-300 placeholder:uppercase placeholder:tracking-widest"
                    />
                  </div>'''
)

# Fix Register Phone Input
content = content.replace(
    '''                  {/* Phone Number */}
                  <div className="relative">
                    <Phone className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      type="text"
                      value={registerPhone}
                      onChange={(e) => handleRegisterPhoneChange(e.target.value)}
                      placeholder="+998 90 123 45 67"
                      className="w-full bg-transparent border-b border-slate-200 py-3 pl-8 text-xs md:text-sm font-semibold text-[#2c3b6e] tracking-normal focus:outline-none focus:border-[#2c3b6e] transition-colors placeholder:text-slate-300 placeholder:uppercase placeholder:tracking-widest"
                    />
                    {registerPhone && !isPhoneValid(registerPhone) && (
                      <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-wider">
                        Номер должен быть в формате +998 и содержать 9 цифр после кода (введено: {registerPhone.replace(/[^0-9]/g, "").length}/12 цифр)
                      </p>
                    )}
                  </div>''',
    '''                  {/* Phone Number */}
                  <div>
                    <div className="flex items-center border-b border-slate-200 py-3 focus-within:border-[#2c3b6e] transition-colors">
                      <Phone className="w-4 h-4 text-slate-300 mr-3 flex-shrink-0" />
                      <input 
                        type="text"
                        value={registerPhone}
                        onChange={(e) => handleRegisterPhoneChange(e.target.value)}
                        placeholder="+998 90 123 45 67"
                        className="w-full bg-transparent text-xs md:text-sm font-semibold text-[#2c3b6e] tracking-normal focus:outline-none placeholder:text-slate-300 placeholder:uppercase placeholder:tracking-widest"
                      />
                    </div>
                    {registerPhone.replace(/[^0-9]/g, "").length > 3 && !isPhoneValid(registerPhone) && (
                      <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-wider">
                        Номер должен быть в формате +998 и содержать 9 цифр после кода (введено: {registerPhone.replace(/[^0-9]/g, "").length}/12 цифр)
                      </p>
                    )}
                  </div>'''
)

with open(file_path, "w") as f:
    f.write(content)
print("done")
