import { PackageExtractor } from "./PackageExtractor";
import * as fs from "fs";

jest.mock("fs");

const mockedFs = jest.mocked(fs);

describe("PackageExtractor", () => {
  const mockProjectsPath = "/projects";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("extractAllProjectsPackages", () => {
    it("should return an object with both dependencies and devDependencies", () => {
      // Arrange
      const fakePackageJson = {
        name: "myProject",
        dependencies: { express: "4.17.1" },
        devDependencies: { jest: "27.0.0" },
      };
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(fakePackageJson));

      // Act
      const extractor = new PackageExtractor(true);
      const result = extractor.extractAllProjectsPackages(mockProjectsPath, {
        myProject: "/projects/myProject",
      });

      // Assert
      expect(result).toEqual([
        {
          dependencies: fakePackageJson.dependencies,
          devDependencies: fakePackageJson.devDependencies,
          projectName: "myProject",
          projectPath: "/projects/myProject",
        },
      ]);
    });

    it("should return an empty object if there are no dependencies", () => {
      // Arrange
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(
        JSON.stringify({ name: "empty-project", version: "1.0.0" })
      );

      // Act
      const extractor = new PackageExtractor();
      const result = extractor.extractAllProjectsPackages(mockProjectsPath, {
        emptyProject: "/projects/emptyProject",
      });

      // Assert
      expect(result).toEqual([
        {
          dependencies: {},
          projectName: "emptyProject",
          projectPath: "/projects/emptyProject",
        },
      ]);
    });

    it("should return real version of dependency", () => {
      // Arrange
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockImplementation((path) => {
        if (path.toString().includes("express")) {
          return JSON.stringify({
            name: "express",
            version: "4.18.12",
          });
        } else {
          return JSON.stringify({
            name: "real-project",
            dependencies: { express: "^4.17.1" },
          });
        }
      });

      // Act
      const extractor = new PackageExtractor();
      const result = extractor.extractAllProjectsPackages(mockProjectsPath, {
        realProject: "/projects/realProject",
      });

      // Assert
      expect(result).toEqual([
        {
          dependencies: { express: "^4.17.1" },
          projectName: "realProject",
          projectPath: "/projects/realProject",
          realVersions: { express: "4.18.12" },
        },
      ]);
    });
  });
});
