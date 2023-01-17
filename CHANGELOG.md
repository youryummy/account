# 1.0.0 (2023-01-17)


### Bug Fixes

* Added accounts to mongo collection ([d4dc74e](https://github.com/youryummy/account/commit/d4dc74e63e1388cb2e76712cce51eca1c3b8f4f8))
* Added advanced plan to model ([2c4cc27](https://github.com/youryummy/account/commit/2c4cc27265c0cd15349de365ff2a19f55df96d13))
* Added default values for helm chart ([02549e8](https://github.com/youryummy/account/commit/02549e8f691a911bd80e782cf718c2c99e5d46d1))
* Added domain to Set-Cookie upon acc deletion ([55c1323](https://github.com/youryummy/account/commit/55c13232f98e501bac12ec132bb45eafde69e7ae))
* Added missing env var to k8s deployment ([99e5661](https://github.com/youryummy/account/commit/99e566127f31deae34a6b0e0d1d247443961e9dc))
* Added missing env vars to okteto manifest ([04d146c](https://github.com/youryummy/account/commit/04d146ceff73dc79ccc9dd2b94ae04da24114cde))
* Added nameOverride to circuitBreaker ([2c650a0](https://github.com/youryummy/account/commit/2c650a0d654a2a097bf3c94b5f4220d212f5efbd))
* Avoid password being required on PUT ([ce259ff](https://github.com/youryummy/account/commit/ce259ff400d4468470b2a4601ab61e96742e1370))
* Avoid username modification ([b08c2f8](https://github.com/youryummy/account/commit/b08c2f84809c5e6983b9d6e8819035c43bef1b8b))
* Changed token lists to be id lists ([e328261](https://github.com/youryummy/account/commit/e328261897e9f00c2972d8ad7fd684103b966b70))
* Circuit breaker opening on 400 request ([c3bdaf5](https://github.com/youryummy/account/commit/c3bdaf53c4508cb42aa1ced6a068551c559f96f4))
* Commented call to planner in JWT sign ([b9858c5](https://github.com/youryummy/account/commit/b9858c5bae296503fb48cef3ff7ffd0b1fef2b3d))
* Consistent state in Firebase ([381b7e2](https://github.com/youryummy/account/commit/381b7e2173d7a2231b8dc7beaa681a65f50748a3))
* Error when deploying helm due to null secret ([f46a90c](https://github.com/youryummy/account/commit/f46a90c94b5a4ffdba9017a1597911724ac7a4e3))
* Fixed wrong reference in Register endpoint ([542e3f3](https://github.com/youryummy/account/commit/542e3f35a3b865e40c570b413450d6af3896aa93))
* Increased the timeout for some tests ([d3bb742](https://github.com/youryummy/account/commit/d3bb7429c593bedd75bfc9038050d0d43c591c06))
* Logout when account is deleted ([5c85b1c](https://github.com/youryummy/account/commit/5c85b1cfcb09b733cb69c8fc7c7243fa282c0cde))
* Prevent memory leak in circuit breaker ([f200a93](https://github.com/youryummy/account/commit/f200a933c7cc74a8e66213fac07248e26c797176))
* Quoted firebase key in okteto manifest ([8ac7fe5](https://github.com/youryummy/account/commit/8ac7fe516c856ecf2e476217c0d89e6562075dd0))
* Removed "-" from okteto image env variable ([6dc8a42](https://github.com/youryummy/account/commit/6dc8a4231c8786278e0cd05d6bdd60bb568fff73))
* Removed password pattern from credentials ([a05d64c](https://github.com/youryummy/account/commit/a05d64ce34e2fcff0d09826730301de726c184f4))
* Replaced wrong image name in okteto.yaml ([fe939ba](https://github.com/youryummy/account/commit/fe939ba7887806f0208ca0cb8df908930ba7eafe))
* Rollback last change ([b5c2b44](https://github.com/youryummy/account/commit/b5c2b44fa6d9bb412439bb375bc3c4cea66dca21))
* Set cookie to allow csrf ([aa8d3c6](https://github.com/youryummy/account/commit/aa8d3c672bd60c4f94e570c0294b3a8ce25b3145))
* Set k8s service port to 80 ([8dd64e3](https://github.com/youryummy/account/commit/8dd64e3a69e278bb7d7cf4283abe141319f5da23))
* Token modified recipe attribute in token ([d7fe859](https://github.com/youryummy/account/commit/d7fe85910b1b08da61a185b96a4209380e8cdcb8))
* Updated okteto manifest ([eece6a0](https://github.com/youryummy/account/commit/eece6a0367c77daf1978fe2d4dfcbdf22aff9ba0))
* Using base64 encoded credentials for okteto ([9babe0d](https://github.com/youryummy/account/commit/9babe0d1dcc1a7c900f430def6cff6ec391fd7f3))


### Features

* Added feature toggles ([c642cb6](https://github.com/youryummy/account/commit/c642cb66b1f2be375357fe8e4a89c18f8dd575ad)), closes [#1](https://github.com/youryummy/account/issues/1)
* Created HELM chart ([cf7284a](https://github.com/youryummy/account/commit/cf7284a541798b69c2d68d9713a699a5d209fe48))
* Created okteto manifest ([574544e](https://github.com/youryummy/account/commit/574544e6d2fe42cc39d4d6e96e63a0819beb993f))
* Implemented account modification ([819dee8](https://github.com/youryummy/account/commit/819dee851c40c5f752f41129284cdc8ae8a9149c)), closes [#5](https://github.com/youryummy/account/issues/5)
* Implemented authentication and authorization ([112fa97](https://github.com/youryummy/account/commit/112fa976c1dccb481c9c202aacf7e72f7d4abd90)), closes [#10](https://github.com/youryummy/account/issues/10)
* Implemented circuit breaker ([29b5885](https://github.com/youryummy/account/commit/29b58850a5905c2fd0aa73b351031d01cc6141f9)), closes [#9](https://github.com/youryummy/account/issues/9)
* Implemented connection to MongoDBAtlas ([983549d](https://github.com/youryummy/account/commit/983549d808522adc6e950c00883a6deb167a04c9)), closes [#12](https://github.com/youryummy/account/issues/12)
* Implemented delete endpoint ([0855594](https://github.com/youryummy/account/commit/0855594060e5d04a81241478d903e4d2c98933aa)), closes [#6](https://github.com/youryummy/account/issues/6)
* Implemented firebase connection ([3dacac3](https://github.com/youryummy/account/commit/3dacac39f4d834b4a7c35f159740ccee333063b2))
* Implemented list and find ([f32a171](https://github.com/youryummy/account/commit/f32a171aaf9eb756f7d45de6a4d288b054d0f6f8)), closes [#3](https://github.com/youryummy/account/issues/3)
* Implemented login and registration ([27c2814](https://github.com/youryummy/account/commit/27c28140446e4f3d0381225682ddf582d2d30a86)), closes [#8](https://github.com/youryummy/account/issues/8) [#7](https://github.com/youryummy/account/issues/7)
* Implemented refreshToken function ([c9cfb8f](https://github.com/youryummy/account/commit/c9cfb8fc7eddda7e30eb35d9ca82a8c4b3315135))
* Initial service setup ([f4eda95](https://github.com/youryummy/account/commit/f4eda95876f9209de4f99df10d2d54455fe09b05)), closes [#2](https://github.com/youryummy/account/issues/2) [#1](https://github.com/youryummy/account/issues/1)
* Integrated call to recipebook ([9e756af](https://github.com/youryummy/account/commit/9e756afb9b3415d1c568c10f3d529cca05bdc3da))
* Integrated JWT token attributes ([714f4f0](https://github.com/youryummy/account/commit/714f4f04c1f90de8ab860fdd93078d76875d300e))
* Setup linter and coverage library ([464dcad](https://github.com/youryummy/account/commit/464dcad1d2b1ec910292bb2a77b29f568902810a)), closes [#15](https://github.com/youryummy/account/issues/15)
* Support for pre-production environment ([c5aa045](https://github.com/youryummy/account/commit/c5aa045fe89ecc2fbd8f81f61d910b22662b5690))
* Updated helm deployment for okteto ([69415bf](https://github.com/youryummy/account/commit/69415bf3c4417d4149c8f88e74c09563788445d3)), closes [#11](https://github.com/youryummy/account/issues/11)



