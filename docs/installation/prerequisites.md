---
id: prerequisites
title: Prerequisites
sidebar_label: Prerequisites
---

## Installation Requirements

- Three Kubernetes worker node or more
- Each worker node needs
  - At least two SSDs, for IOMesh journal and cache
  - At least one HDD, for IOMesh datastore
  - A 10GbE (or better) NICs, for IOMesh Data Network
  - 100G filesystem per worker for hostpath-provisioner

## Setup Kubernetes Cluster

### Enable Kubernetes Features

Enable Kubernetes CSI features to ensure IOMesh CSI Driver works. After a feature is GA, some feature gates will be removed in next few versions.

All CSI features are enabled by default in Kubernetes v1.17 or higher version.

For more details, please check Kubernetes **[Feature Gates][1]** to enable features selectively.
[1]: https://kubernetes.io/docs/reference/command-line-tools-reference/feature-gates "Kubernetes - Feature Gates"

#### Configure Kubernetes feature gates deployed by kubeadm

Different Kubernetes clusters may have different ways to configure, here we assume the cluster is deployed by `kubeadm`. If you're using other Kubernetes Deployment Tools, you should check that tools' documentation.

1. Enable feature gates on each `kube-apiserver` instance.

   Open and edit `/etc/kubernetes/manifests/kube-apiserver.yaml`. The following YAML shows the result of edition.

```yaml
# /etc/kubernetes/manifests/kube-apiserver.yaml
apiVersion: v1
kind: Pod
metadata:
  name: kube-apiserver
  namespace: kube-system
spec:
  containers:
  - command:
    - kube-apiserver
    # add feature-gates here
    - --feature-gates=CSINodeInfo=true,CSIDriverRegistry=true,CSIBlockVolume=true,VolumeSnapshotDataSource=true,VolumePVCDataSource=true,ExpandCSIVolumes=true,ExpandInUsePersistentVolumes=true
    # enable privileged here
    - --allow-privileged=true
```

2. Enable feature gates on each `kubelet` systemd service file.

   Open and edit `/usr/lib/systemd/system/kubelet.service.d/10-kubeadm.conf`

```yaml
# /usr/lib/systemd/system/kubelet.service.d/10-kubeadm.conf
# Note: This dropin only works with kubeadm and kubelet v1.11+
[Service]
# --> enable feature-gates here <--
Environment="KUBELET_KUBECONFIG_ARGS=--bootstrap-kubeconfig=/etc/kubernetes/bootstrap-kubelet.conf --kubeconfig=/etc/kubernetes/kubelet.conf --feature-gates=CSINodeInfo=true,CSIDriverRegistry=true,CSIBlockVolume=true,VolumeSnapshotDataSource=true,VolumePVCDataSource=true,ExpandCSIVolumes=true,ExpandInUsePersistentVolumes=true"
Environment="KUBELET_CONFIG_ARGS=--config=/var/lib/kubelet/config.yaml"
# This is a file that "kubeadm init" and "kubeadm join" generates at runtime, populating the KUBELET_KUBEADM_ARGS variable dynamically
EnvironmentFile=-/var/lib/kubelet/kubeadm-flags.env
# This is a file that the user can use for overrides of the kubelet args as a last resort. Preferably, the user should use
# the .NodeRegistration.KubeletExtraArgs object in the configuration files instead. KUBELET_EXTRA_ARGS should be sourced from this file.
EnvironmentFile=-/etc/sysconfig/kubelet
ExecStart=
ExecStart=/usr/bin/kubelet $KUBELET_KUBECONFIG_ARGS $KUBELET_CONFIG_ARGS $KUBELET_KUBEADM_ARGS $KUBELET_EXTRA_ARGS
```

3. Reload systemd daemon

```shell
systemctl daemon-reload
systemctl restart kubelet
```

4. Wait until kubelet and kube-apiserver ready

```shell
systemctl status kubelet
```

```output
● kubelet.service - kubelet: The Kubernetes Node Agent
   Loaded: loaded (/usr/lib/systemd/system/kubelet.service; enabled; vendor preset: disabled)
  Drop-In: /usr/lib/systemd/system/kubelet.service.d
           └─10-kubeadm.conf
   Active: active (running) since Mon 2020-09-23 14:36:18 CST;
```

```shell
kubectl wait --for=condition=Ready  pod/kube-apiserver-<suffix> -n kube-system
```

```output
pod/kube-apiserver-<suffix> condition met
```


### Deploy Snapshot Controller

> Only for `Kubernetes >= v1.13.0`

Volume Snapshot Controller manages the snapshot CRDs.
There must be **only one instance** of Volume Snapshot Controller running and **only one set** of volume snapshot CRDs installed per cluster.

1. Clone **[Kubernetes CSI external-controller](https://github.com/kubernetes-csi/external-snapshotter/tree/release-2.1)**

```shell
curl -LO https://github.com/kubernetes-csi/external-snapshotter/archive/release-2.1.zip
unzip release-2.1.zip && cd external-snapshotter-release-2.1
```

2. Create Snapshot beta CRD

```shell
kubectl create -f ./config/crd
```

3. Open and edit `deploy/kubernetes/snapshot-controller/setup-snapshot-controller.yaml`. Add a namespace for StatefulSet. eg. `kube-system`

   Editing results are showing below.

   ```yaml
   kind: StatefulSet
   apiVersion: apps/v1
   metadata:
     name: snapshot-controller
     namespace: kube-system # <-- Add namespace here
   # ...
   ```

4. Open and edit `deploy/kubernetes/snapshot-controller/rbac-snapshot-controller.yaml`. Add a namespace for StatefulSet. eg. `kube-system`

   Editing results are showing below.

   ```yaml
   apiVersion: v1
   kind: ServiceAccount
   metadata:
     name: snapshot-controller
     namespace: kube-system # <-- Add namespace here
   # ...
   ```

5. Install Snapshot Controller

```shell
kubectl apply -f ./deploy/kubernetes/snapshot-controller
```

6. Verify snapshot-controller installation

```shell
kubectl get sts snapshot-controller -n kube-system
```

```output
NAME                  READY   AGE
snapshot-controller   1/1     32s
```

## Setup worker node

For each Kubernetes worker node that you want to run IOMesh, do the following setups:

1. Install open-iscsi

For RHEL/CentOS:

```shell
sudo yum install iscsi-initiator-utils -y
```

For Ubuntu:

```shell
sudo apt-get install open-iscsi -y
```

2. Set `node.startup` to `manual` in `/etc/iscsi/iscsid.conf`

```shell
sudo sed -i 's/^node.startup = automatic$/node.startup = manual/' /etc/iscsi/iscsid.conf
```

3. Disable SELinux

```shell
sudo setenforce 0
suso sed -i 's/^SELINUX=enforcing$/SELINUX=permissive/' /etc/selinux/config
```

4. Enable and start `iscsid` service

```shell
sudo systemctl enable --now iscsid
```
