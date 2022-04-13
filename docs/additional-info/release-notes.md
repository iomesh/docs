---
id: release-notes
title: Release Notes
sidebar_label: Release Notes
---


## IOMesh 0.11.0

### What's New

#### New Features

##### Installation and Deployment
* Support deployment of the IOMesh cluster in all-flash mode.
* Support deployment of the IOMesh cluster using the offline installation package.

##### Storage Capability
Support access to storage services using the iSCSI protocol on the compute platforms affiliated with IOMesh outside the Kubernetes cluster. 

##### Maintenance and Management
* Implement the NodeGetVolumeStas interface in CSI Spec and support PV monitoring with integrated systems such as Prometheus.
* Support checking the connection status of Chunk services.


#### Improved Features
* Reserve CPU and memory resources for IOMesh Operator, NDM, Zookeeper Operator to ensure the QoS of their pods.
* Provide Webhooks to avoid unexpected parameter changes of clusters.
* Simplified IOMesh installation by improving the IOMesh deployment script.
* Optimized the license renewal method to update the license using the Kubernetes API. 
* Optimized the replication policy with only replication factor two or three is supported.
* Optimized the process of ZBS version upgrade.
* Optimize the Liveness/Readyness configuration of IOMesh pods to avoid repeated restarts of IOMesh pods due to high system load.


#### Fixes
* NDM 1.7.x created partitions for the disk by default when the WWID was not identified, causing the disk to be not mounted as cacheWithJournal or dataStoreWithJournal.
* The disk might be unable to be mounted when installing IOMesh Operator in the OpenShift Container Platform.
* The IOMesh system crashed because the loop device had been mounted by NDM.
* Probe was unable to access the process name and caused a CrashLoop, as the process name had been modified.
* Memory leaked because Probe did not reclaim RPC connections.
* Memory leaked due to ZBS Client not being closed.
* The newly created pods bound to PVCs timed out when the number of pods bound to PVCs on a Kubernetes worker node exceeded 100.
* A timeout occurred when formatting a PV as an XFS file system, as the capacity of PV exceeded 5TB.
* The disk could not be mounted, but device manager logs showed messages of successful mounting.

#### Known Issues 
* Copies of PVs by CSI volume cloning may not match with original PVs.
* The number of PVs per session cannot exceed 100,000.

### Specifications
Component
Version
iomesh-operator
0.11.0
csi-driver
2.4.0
zbs
5.2.0
zookeeper
3.5.9
node-disk-manager
1.8.0
hostpath-provisioner
0.5.2

### Compatibility

IOMesh supports servers running on Intel x86_64 and AMD x86_64 architectures.

IOMesh Compatibility 

Software/OS
Compatible Version
Kubernetes
Kubernetes v1.17~v1.21
OpenShift v3.11~v4.8
Linux OS
CentOS 7
CentOS 8
CoreOS
RHEL 7
RHEL 8

### Download Links
IOMesh Offline Installation Package
* Download Links:
https://cm.smartx.com/share?code=e2cc01ef-95cb-4e60-a745-b88365488636
* MD5:25facf99281705129a9920bb899e43d2 



