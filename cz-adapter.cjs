exports.prompter = async (inquirerIns, commit) => {
  ;(await import('@commitlint/cz-commitlint')).prompter(inquirerIns, commit)
}
