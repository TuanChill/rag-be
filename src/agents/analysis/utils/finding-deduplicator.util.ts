/**
 * Finding Deduplicator Utility
 * Phase 5: Analysis Agents
 *
 * Handles deduplication, merging, and filtering of findings
 */
import { Finding } from '../interfaces/finding.interface';

export class FindingDeduplicatorUtil {
  /**
   * Remove duplicate findings based on similarity
   */
  static deduplicate(findings: Finding[]): Finding[] {
    const unique: Finding[] = [];
    const seen = new Set<string>();

    for (const finding of findings) {
      const key = this.generateKey(finding);
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(finding);
      }
    }

    return unique;
  }

  /**
   * Generate a unique key for a finding
   */
  private static generateKey(finding: Finding): string {
    const normalizedTitle = finding.title.toLowerCase().trim();
    const normalizedDesc = finding.description.toLowerCase().slice(0, 100);
    return `${finding.type}:${normalizedTitle}:${normalizedDesc}`;
  }

  /**
   * Merge findings from multiple agents
   */
  static merge(findingsArrays: Finding[][]): Finding[] {
    const allFindings = findingsArrays.flat();
    return this.deduplicate(allFindings);
  }

  /**
   * Sort findings by severity
   */
  static sortBySeverity(findings: Finding[]): Finding[] {
    const severityOrder = { critical: 0, major: 1, minor: 2, info: 3 };
    return findings.sort(
      (a, b) => severityOrder[a.severity] - severityOrder[b.severity],
    );
  }

  /**
   * Limit findings by severity threshold
   */
  static filterBySeverity(
    findings: Finding[],
    threshold: 'critical' | 'major' | 'minor' | 'info',
  ): Finding[] {
    const severityOrder = { critical: 0, major: 1, minor: 2, info: 3 };
    const thresholdValue = severityOrder[threshold];

    return findings.filter((f) => severityOrder[f.severity] <= thresholdValue);
  }
}
