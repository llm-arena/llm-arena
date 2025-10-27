const Configuration = {
  extends: ['@commitlint/config-conventional'],
  ignores: [(message: string) => message.startsWith('chore: bump')], // Ignore dependabot commits
};

export default Configuration;
