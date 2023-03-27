---
id: basic-concepts
title: Basic Concepts
sidebar_label: Basic Concepts
---

Before deploying and using IOMesh, familiarity with the following concepts is suggested.

**Kubernetes**

An open source container orchestration platform for managing containerized workloads and services, facilitating both declarative configuration and automation.

**Node**

A worker machine in Kubernetes that runs containerized workloads, which can be a virtual machine or a physical machine, depending on the cluster. A Kubernetes node usually has two types of nodes: control plane nodes and worker nodes.

**Worker Node**

A worker machine that runs Kubernetes node components and containerized applications. IOMesh is installed, deployed, and running on the worker node. 

**kubectl**

A command line tool to communicate with the control plane of a Kubernetes cluster through the Kubernetes API.

**Stateful Application**

Applications can be stateful or stateless. A stateful application saves data to persistent disk storage for use by the server, client, and other applications while a stateless application does not save client data to the server when switching sessions.

**CSI**

Container storage interface. A standard for exposing arbitrary block and file storage systems to containerized workloads on Container Orchestration Systems (COs) like Kubernetes.

**IOMesh Block Storage**

IOMesh high-performance block storage service for guaranteeing distributed system consistency and data coherence, managing metadata and local disks, and providing I/O redirection and high availability.

**IOMesh CSI Driver**

The CSI driver that complies with the Kubernetes CSI standard, managing PVs using RPC (Remote Procedure Call) to provide persistent storage for data applications running on Kubernetes. Each Kubernetes persistent volume corresponds to an iSCSI LUN in an IOMesh cluster.

**IOMesh Operator**

The automated O&M component of IOMesh, allowing for rolling upgrades of IOMesh, scaling up or down nodes, GitOps, and also automatic discovery, allocation, and management of block devices.

**Namespace**

Provides a mechanism for dividing resources in the same cluster into isolated groups that can be created on demand and managed separately within a cluster.

**StorageClass**

Provides a way for administrators to describe the classes of storage they offer or a template for dynamically provisioning PVs. 

**Persistent Volume**

A piece of storage in the cluster, which can be pre-provisioned by the administrator or dynamically provisioned using StorageClass. Persistent volumes, like other types of volumes, are implemented using volume plugins, but they have a lifecycle independent of any Pod using PV. 

**Persistent Volume Claim**

PersistentVolumeClaim (PVC) expresses a user request for storage. Conceptually similar to a pod, a pod consumes node resources, while a PVC consumes PV resources; a Pod can request a specific amount of resources like CPU and memory, and similarly a PVC can request a specific size of storage and access mode

**Volume Snapshot**

A user request for a snapshot of a volume, which is similar to a persistent volume request.

**Volume Snapshot Class**

Provides a way to describe the classes of storage when provisioning a volume snapshot and allows you to specify different attributes belonging to a VolumeSnapshot, which may differ among snapshots taken from the same volume on the storage system and therefore cannot be expressed by using the same StorageClass of a PersistentVolumeClaim.

**Volume Snapshot Content**

A snapshot taken from a volume in the cluster that has been provisioned by an administrator. It is a resource in the cluster just like a PersistentVolume is a cluster resource.

**Volume Mode**

An optional API parameter that describes. Kubernetes supports two `volumeModes` of PersistentVolumes: `Filesystem` and `Block`.

`filesystem`: a volume with the volumeMode property set to filesystem is mounted (mounted) to a directory by the Pod.

`block`: Use a volume as a raw block device which provides a Pod the fastest possible way to access a volume, without any filesystem layer between the Pod and the volume.

**Access Mode**

The access mode supported by the persistent volume. A persistent volume can be mounted on a host in any way supported by the resource provider. The access modes supported by a persistent volume vary depending on the capabilities of the resource provider. The access modes are as follows:

`ReadWriteOnce`: The volume can be mounted as read-write by a single node. ReadWriteOnce access mode still can allow multiple pods to access the volume when the pods are running on the same node.

`ReadOnlyMany`: The volume can be mounted as read-only by many nodes.

`ReadWriteMany`: The volume can be mounted as read-write by many nodes.

`ReadWriteOncePod`: the volume can be mounted as read-write by a single Pod. Use ReadWriteOncePod access mode if you want to ensure that only one pod across whole cluster can read that PVC or write to it. This is only supported for CSI volumes and Kubernetes version 1.22+.

IOMesh supports access modes above, but `ReadWriteMany` and `ReadOnlyMany` are only for PVs with `volumemode` as Block.

**Helm**

A package manager for Kubernetes that helps find, share, and build Kubernetes with software. Helm Chart can help define, install, and upgrade even the most complex Kubernetes applications. IOMesh supports deployments using Helm Chart.

**Prometheus**

An open source system monitoring and alerting toolkit that can be integrated with IOMesh to monitor IOMesh storage metrics and send instant alerts.

**Grafana**

An open source analytics and interactive visualization web application, providing charts, graphs, and alerts for the web when connected to supported data sources. With Grafana, you can import standard Grafana dashboard template and alerting rule file to visualize IOMesh storage.




