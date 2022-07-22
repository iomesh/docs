---
title: IOMesh 0.11.1 Release Notes
author: SmartX Documentation Team 
hide_title: true
id: 0.11.1 Release Notes
sidebar_label: IOMesh 0.11.1 Release Notes
---

# IOMesh 0.11.1 Release Notes

The release notes cover the following topics:

 - [What's New](#new-features)
 - [Component Versions](#component-versions)
 - [Compatibility Notes](#compatibility-notes)
 - [Download Links](#download-links)

## What's New 

### New Feature

Add support for Kubernetes versions 1.22 to 1.24.

### Improved Features

- Optimized the method of clearing corresponding LUNs in IOMesh after deleting the PV with its retention policy set to **Retain**. 
- Optimized `open-iscsi` containerization so that IOMesh installation and operation will not rely on Linux distros.
- Simplified Snapshot Controller installation. The Snapshot Controller will be installed with IOMesh. 

### Fixed Problems
- Fixed the problem that the name of `iscsi-redirectd daemonset` did not conform to the naming convention.
- Fixed the problem that the operations of PR (Persistent Reservation) might fail due to non-compliance with the SCSI-3 PR protocol.
- Fixed the problem that the time to mount a disk was occasionally too long.
- Fixed the problem that configurations could not take effect when the user customized the NDM image repository.
- Fixed the problem that the number of PV replicas created or cloned from snapshots did not match that of original PV replicas.

## Component Versions

| Component | Version|
| -------| -------|
|IOMesh Operator|0.11.1|
| CSI Driver| 2.5.1|
|ZBS|5.1.2|
|Zookeeper|3.5.9|
|Node Disk Manager|1.8.0|
|Hostpath Provisioner|0.5.2|

## Compatibility Notes

### IOMesh and Server Architecture Compatibility  

IOMesh is compatible with Intel x86_64 and AMD x86_64 architectures.

### IOMesh and Kubernetes Compatibility
IOMesh is compatible with Kubernetes versions 1.17 to 1.24.

### IOMesh and Linux OS Compatibility
IOMesh is compatible with CentOS 7, CentOS 8, CoreOS, RHEL 7, and RHEL 8.

## Download Links

### IOMesh Offline Installation Package
- Download Links
     
       >- <>

    - MD5: 

        ```
        
        ```








