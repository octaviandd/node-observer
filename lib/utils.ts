/*
 * Check for installed packages
 * @param npmPackage
 * @returns @boolean
 */
function isPackageInstalled(npmPackage: string) {
  try {
    require.resolve(npmPackage);
    return true;
  } catch (e) {
    return false;
  }
}