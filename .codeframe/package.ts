import { BuildType, OUTPUT_DIR } from "../../../../src/types/package-config.ts";
import { runPackageAction } from "../../../../src/commands/packages.ts";

import { resolve, join } from "node:path";
import { argv, env } from "node:process";

export const build = (cwd: string = process.cwd()): BuildType => {
  const TOOLCHAINS = resolve(cwd, "../../../toolchains/cmake-tools");
  const LINUX = resolve(cwd, "../../../toolchains/linux");
  const toolchain = resolve(cwd, "../../../toolchains/llvm-mingw");
  const CLANG = join(toolchain, "bin/clang.exe").replace(/\\/g, "/");
  const CLANGXX = join(toolchain, "bin/clang++.exe").replace(/\\/g, "/");
  const WINDRES = join(toolchain, "bin/llvm-windres.exe").replace(/\\/g, "/");
  const AARCH64_WINDRES = join(
    toolchain,
    "bin/aarch64-w64-mingw32-windres.exe"
  ).replace(/\\/g, "/");

  // Get the CODE_FRAME env variable
  const CODE_FRAME = env.CODE_FRAME;
  if (!CODE_FRAME) {
    throw new Error(
      "ERROR: CODE_FRAME environment variable is not set. Please set it to the root of your dependencies."
    );
  }

  // Construct the path to your pkgconf.exe
  const PKG_CONFIG = join(
    CODE_FRAME,
    "dependencies/cpp/clang/bin/pkgconf.exe"
  ).replace(/\\/g, "/");

  return {
    type: "architectures",
    windows_x86_64: {
      configStep: `cmake -S . -B build/windows/x86_64 -G Ninja \
      -DCMAKE_TOOLCHAIN_FILE=${TOOLCHAINS}/windows_x86-64.cmake \
      -DCMAKE_BUILD_TYPE=Release \
      -DBUILD_SHARED_LIBS=ON \
      -DUPDATE_DEPS=ON \
      -DBUILD_TESTS=OFF \
      -DCMAKE_C_COMPILER=${CLANG} \
      -DCMAKE_CXX_COMPILER=${CLANGXX} \
      -DCMAKE_RC_COMPILER=${WINDRES} \
      -DVulkanUtilityLibraries_DIR=${process.cwd()}/external/Windows/Release/x86_64/Vulkan-Utility-Libraries/build/install/lib/cmake/VulkanUtilityLibraries \
      -DVulkanHeaders_DIR=${process.cwd()}/external/Windows/Release/x86_64/Vulkan-Headers/build/install/share/cmake/VulkanHeaders \
      -DSPIRV-Headers_DIR=${process.cwd()}/external/Windows/Release/x86_64/SPIRV-Headers/build/install/share/cmake/SPIRV-Headers \
      -DSPIRV-Tools_DIR=${process.cwd()}/external/Windows/Release/x86_64/SPIRV-Tools/build/install/lib/cmake/SPIRV-Tools \
      -Dglslang_DIR=${process.cwd()}/external/Windows/Release/x86_64/glslang/build/install/lib/cmake/glslang \
      -Dmimalloc_DIR=${process.cwd()}/external/Windows/Release/x86_64/mimalloc/build/install/lib/cmake/mimalloc \
      -DHELPER_CMAKE=${process.cwd()}/external/Windows/Release/x86_64/helper.cmake \
      -DCMAKE_PREFIX_PATH=${process.cwd()}/external/Windows/Release/x86_64/SPIRV-Tools/build/install;\
        ${process.cwd()}/external/Windows/Release/x86_64/SPIRV-Headers/build/install;\
        ${process.cwd()}/external/Windows/Release/x86_64/Vulkan-Utility-Libraries/build/install;\
        ${process.cwd()}/external/Windows/Release/x86_64/Vulkan-Headers/build/install;\
        ${process.cwd()}/external/Windows/Release/x86_64/glslang/build/install;\
        ${process.cwd()}/external/Windows/Release/x86_64/mimalloc/build/install \
      -DCMAKE_INSTALL_PREFIX=../${OUTPUT_DIR}/vulkan-validation-layers/windows/x86_64
    `,

      buildStep: `cmake --build build/windows/x86_64 -j`,
      installStep: `cmake --install build/windows/x86_64`,
    },
    windows_aarch64: {
      configStep: `cmake -S . -B build/windows/aarch64 -G Ninja \
      -DCMAKE_TOOLCHAIN_FILE=${TOOLCHAINS}/windows_aarch64.cmake \
      -DCMAKE_BUILD_TYPE=Release \
      -DBUILD_SHARED_LIBS=OFF \
      -DUPDATE_DEPS=ON \
      -DBUILD_TESTS=OFF \
      -DUSE_MASM=OFF \
      -DCMAKE_C_COMPILER=${CLANG} \
      -DCMAKE_CXX_COMPILER=${CLANGXX} \
      -DCMAKE_RC_COMPILER=${AARCH64_WINDRES} \
      -DCMAKE_RC_FLAGS=--target=aarch64-w64-mingw32 \
      -DVulkanUtilityLibraries_DIR=${process.cwd()}/external/Windows/Release/aarch64/Vulkan-Utility-Libraries/build/install/lib/cmake/VulkanUtilityLibraries \
      -DVulkanHeaders_DIR=${process.cwd()}/external/Windows/Release/aarch64/Vulkan-Headers/build/install/share/cmake/VulkanHeaders \
      -DSPIRV-Headers_DIR=${process.cwd()}/external/Windows/Release/aarch64/SPIRV-Headers/build/install/share/cmake/SPIRV-Headers \
      -DSPIRV-Tools_DIR=${process.cwd()}/external/Windows/Release/aarch64/SPIRV-Tools/build/install/lib/cmake/SPIRV-Tools \
      -Dglslang_DIR=${process.cwd()}/external/Windows/Release/aarch64/glslang/build/install/lib/cmake/glslang \
      -Dmimalloc_DIR=${process.cwd()}/external/Windows/Release/aarch64/mimalloc/build/install/lib/cmake/mimalloc \
      -DHELPER_CMAKE=${process.cwd()}/external/Windows/Release/aarch64/helper.cmake \
      -DCMAKE_PREFIX_PATH=${process.cwd()}/external/Windows/Release/aarch64/SPIRV-Tools/build/install;\
        ${process.cwd()}/external/Windows/Release/aarch64/SPIRV-Headers/build/install;\
        ${process.cwd()}/external/Windows/Release/aarch64/Vulkan-Utility-Libraries/build/install;\
        ${process.cwd()}/external/Windows/Release/aarch64/Vulkan-Headers/build/install;\
        ${process.cwd()}/external/Windows/Release/aarch64/glslang/build/install;\
        ${process.cwd()}/external/Windows/Release/aarch64/mimalloc/build/install \
      -DCMAKE_INSTALL_PREFIX=../${OUTPUT_DIR}/vulkan-validation-layers/windows/aarch64
      `,
      buildStep: `cmake --build build/windows/aarch64 -j`,
      installStep: `cmake --install build/windows/aarch64`,
    },
    linux_x86_64: {
      configStep: `cmake -S . -B build/linux/x86_64 -G Ninja \
      -DCMAKE_TOOLCHAIN_FILE=${TOOLCHAINS}/linux_x86-64.cmake \
      -DCMAKE_BUILD_TYPE=Release \
      -DBUILD_SHARED_LIBS=OFF \
      -DUPDATE_DEPS=OFF \
      -DBUILD_TESTS=OFF \
      -DBUILD_WSI_XCB_SUPPORT=OFF \
      -DBUILD_WSI_XLIB_SUPPORT=OFF \
      -DBUILD_WSI_WAYLAND_SUPPORT=OFF \
      -DBUILD_WSI_DIRECTFB_SUPPORT=OFF \
      -DPKG_CONFIG_EXECUTABLE=${PKG_CONFIG} \
      -UWIN32 \
      -DCMAKE_C_COMPILER=${CLANG} \
      -DCMAKE_CXX_COMPILER=${CLANGXX} \
      -DCMAKE_C_COMPILER_TARGET=x86_64-unknown-linux-gnu \
      -DCMAKE_CXX_COMPILER_TARGET=x86_64-unknown-linux-gnu \
      -DCMAKE_ASM_COMPILER_TARGET=x86_64-unknown-linux-gnu \
      -DCMAKE_SYSTEM_PROCESSOR=x86_64 \
      -DVulkanUtilityLibraries_DIR=${process.cwd()}/external/Linux/Release/x86_64/Vulkan-Utility-Libraries/build/install/lib/cmake/VulkanUtilityLibraries \
      -DVulkanHeaders_DIR=${process.cwd()}/external/Linux/Release/x86_64/Vulkan-Headers/build/install/share/cmake/VulkanHeaders \
      -DSPIRV-Headers_DIR=${process.cwd()}/external/Linux/Release/x86_64/SPIRV-Headers/build/install/share/cmake/SPIRV-Headers \
      -DSPIRV-Tools_DIR=${process.cwd()}/external/Linux/Release/x86_64/SPIRV-Tools/build/install/lib/cmake/SPIRV-Tools \
      -Dglslang_DIR=${process.cwd()}/external/Linux/Release/x86_64/glslang/build/install/lib/cmake/glslang \
      -Dmimalloc_DIR=${process.cwd()}/external/Linux/Release/x86_64/mimalloc/build/install/lib/cmake/mimalloc \
      -DHELPER_CMAKE=${process.cwd()}/external/Linux/Release/x86_64/helper.cmake \
      -DCMAKE_PREFIX_PATH=${process.cwd()}/external/Linux/Release/x86_64/SPIRV-Tools/build/install;\
        ${process.cwd()}/external/Linux/Release/x86_64/SPIRV-Headers/build/install;\
        ${process.cwd()}/external/Linux/Release/x86_64/Vulkan-Utility-Libraries/build/install;\
        ${process.cwd()}/external/Linux/Release/x86_64/Vulkan-Headers/build/install;\
        ${process.cwd()}/external/Linux/Release/x86_64/glslang/build/install;\
        ${process.cwd()}/external/Linux/Release/x86_64/mimalloc/build/install \
      -DCMAKE_INSTALL_PREFIX=../${OUTPUT_DIR}/vulkan-validation-layers/linux/x86_64,
      `,
      buildStep: `cmake --build build/linux/x86_64 -j`,
      installStep: `cmake --install build/linux/x86_64`,
    },
    linux_aarch64: {
      configStep: `cmake -S . -B build/linux/aarch64 -G Ninja \
      -DCMAKE_TOOLCHAIN_FILE=${TOOLCHAINS}/linux_aarch64.cmake \
      -DCMAKE_BUILD_TYPE=Release \
      -DBUILD_SHARED_LIBS=OFF \
      -DUPDATE_DEPS=OFF \
      -DBUILD_TESTS=OFF \
      -DBUILD_WSI_XCB_SUPPORT=OFF \
      -DBUILD_WSI_XLIB_SUPPORT=OFF \
      -DBUILD_WSI_WAYLAND_SUPPORT=OFF \
      -DBUILD_WSI_DIRECTFB_SUPPORT=OFF \
      -DPKG_CONFIG_EXECUTABLE=${PKG_CONFIG} \
      -UWIN32 \
      -DCMAKE_C_COMPILER=${CLANG} \
      -DCMAKE_CXX_COMPILER=${CLANGXX} \
      -DCMAKE_ASM_COMPILER=${CLANG} \
      -DCMAKE_C_COMPILER_TARGET=aarch64-unknown-linux-gnu \
      -DCMAKE_CXX_COMPILER_TARGET=aarch64-unknown-linux-gnu \
      -DCMAKE_ASM_COMPILER_TARGET=aarch64-unknown-linux-gnu \
      -DCMAKE_TRY_COMPILE_TARGET_TYPE=STATIC_LIBRARY \
      -DVulkanUtilityLibraries_DIR=${process.cwd()}/external/Linux/Release/aarch64/Vulkan-Utility-Libraries/build/install/lib/cmake/VulkanUtilityLibraries \
      -DVulkanHeaders_DIR=${process.cwd()}/external/Linux/Release/aarch64/Vulkan-Headers/build/install/share/cmake/VulkanHeaders \
      -DSPIRV-Headers_DIR=${process.cwd()}/external/Linux/Release/aarch64/SPIRV-Headers/build/install/share/cmake/SPIRV-Headers \
      -DSPIRV-Tools_DIR=${process.cwd()}/external/Linux/Release/aarch64/SPIRV-Tools/build/install/lib/cmake/SPIRV-Tools \
      -Dglslang_DIR=${process.cwd()}/external/Linux/Release/aarch64/glslang/build/install/lib/cmake/glslang \
      -Dmimalloc_DIR=${process.cwd()}/external/Linux/Release/aarch64/mimalloc/build/install/lib/cmake/mimalloc \
      -DHELPER_CMAKE=${process.cwd()}/external/Linux/Release/aarch64/helper.cmake \
      -DCMAKE_PREFIX_PATH=${process.cwd()}/external/Linux/Release/aarch64/SPIRV-Tools/build/install;\
        ${process.cwd()}/external/Linux/Release/aarch64/SPIRV-Headers/build/install;\
        ${process.cwd()}/external/Linux/Release/aarch64/Vulkan-Utility-Libraries/build/install;\
        ${process.cwd()}/external/Linux/Release/aarch64/Vulkan-Headers/build/install;\
        ${process.cwd()}/external/Linux/Release/aarch64/glslang/build/install;\
        ${process.cwd()}/external/Linux/Release/aarch64/mimalloc/build/install \
      -DCMAKE_INSTALL_PREFIX=../${OUTPUT_DIR}/vulkan-validation-layers/linux/aarch64
      `,
      buildStep: `cmake --build build/linux/aarch64 -j`,
      installStep: `cmake --install build/linux/aarch64`,
    },
  } satisfies BuildType;
};

const args = argv.slice(2);
const [action = "help"] = args;

await runPackageAction(action, process.cwd(), build());
