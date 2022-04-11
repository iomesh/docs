---
id: install-iomesh
title: Install IOMesh
sidebar_label: Install IOMesh
---

## Quick Installation Guide

Choose the right script to execute according to your OS distribution:

> **_NOTE_: Helm3 would be installed automatically if it is not founded.**

<!--DOCUSAURUS_CODE_TABS-->

<!--RHEL7/CentOS7-->

```shell
# Every node running IOMesh must have an IP address belongs to IOMESH_DATA_CIDR
export IOMESH_DATA_CIDR=10.234.1.0/24; curl -sSL https://iomesh.run/install_iomesh_el7.sh | sh -
```

<!--RHEL8/CentOS8/CoreOS-->

```shell
# Every node running IOMesh must have an IP address belongs to IOMESH_DATA_CIDR
export IOMESH_DATA_CIDR=10.234.1.0/24; curl -sSL https://iomesh.run/install_iomesh_el8.sh | sh -
```
<!--END_DOCUSAURUS_CODE_TABS-->

Then wait until all IOMesh Cluster pods are ready:

```shell
watch kubectl get --namespace iomesh-system pods
```

Now IOMesh has been installed successfully!

> **_NOTE_: If any error occurs during the installation process, the IOMesh resources which installed by the script will be reserved for troubleshooting. You can use the uninstall script to clean up all IOMesh resources installed in the k8s cluster:
 `curl -sSL https://iomesh.run/uninstall_iomesh.sh | sh -`**

## Customized Installation Guide

This is the installtion guide for customized configurations.

### Install CSI Snapshotter

The [CSI snapshotter](https://github.com/kubernetes-csi/external-snapshotter) is part of Kubernetes implementation of Container Storage Interface (CSI).
Instasll CSI snapshotter to enable Volume Snapshot feature.

> **_NOTE_: CSI Snapshotter should be installed once per cluster**

1. Download and extract CSI external-snapshotter:

    ```shell
    curl -LO https://github.com/kubernetes-csi/external-snapshotter/archive/release-2.1.tar.gz
    tar -xf release-2.1.tar.gz && cd external-snapshotter-release-2.1
    ```

2. Install Snapshot CRDs:

    ```shell
    kubectl create -f ./config/crd
    ```

3. Edit `deploy/kubernetes/snapshot-controller/rbac-snapshot-controller.yaml` by adding a namespace, e.g., `kube-system`:

    ```shell
    sed -i "s/namespace: default/namespace: kube-system/g" deploy/kubernetes/snapshot-controller/rbac-snapshot-controller.yaml
    ```

4. Install snapshot controller, e.g., `kube-system`:

    ```shell
    kubectl apply -n kube-system -f ./deploy/kubernetes/snapshot-controller
    ```

5. Wait until snapshot controller is ready:

    ```shell
    kubectl get sts snapshot-controller -n kube-system
    ```

    ```output
    NAME                  READY   AGE
    snapshot-controller   1/1     32s
    ```

### Install Helm3

> **_NOTE_: skip this step if Helm3 is already installed.**

```shell
curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3
chmod 700 get_helm.sh
./get_helm.sh
```

For more details, please refer to **[Install Helm](https://helm.sh/docs/intro/install/)**.

### Setup Helm Repo

```shell
helm repo add iomesh http://iomesh.com/charts
```

### Install IOMesh

1. Download `iomesh.yaml` with default configurations:

    ```shell
    helm show values iomesh/iomesh > iomesh.yaml
    ```

2. Customize the `iomesh.yaml`

   **(required)** Fill in the `dataCIDR` according to your network:

    ```yaml
    iomesh:
      chunk:
        dataCIDR: "10.234.1.0/24" # change to your own data network CIDR
    ```

   **(required)** For Kubernetes worker node OS is `CentOS8` or `CoreOS`, set `mountIscsiLock` to `true`. Otherwise, set it to `false`:

    ```yaml
    csi-driver:
      driver:
        node:
          driver:
            mountIscsiLock: true
    ```

    **(optional)** Configure the deployment mode for the cluster, and the default is hybrid-flash deployment. For all-flash deployment, you need to set `diskDeploymentMode` to `allFlash`.

    ```yaml
    diskDeploymentMode: "hybridFlash" # set `diskDeploymentMode` to `allFlash` in all-flash deployment mode
    ```

   **(optional)** If you only want iomesh to use a part of k8s node's disks, 
   configure the specific node's label in the `chunk.podPolicy.affinity`, for
   example:
   
   ```yaml
   iomesh:
     chunk:
       podPolicy:
         affinity:
           nodeAffinity:
             requiredDuringSchedulingIgnoredDuringExecution:
               nodeSelectorTerms:
               - matchExpressions:
                 - key: kubernetes.io/hostname # specific node label's key
                   operator: In
                   values:
                   - iomesh-worker-0 # specific node label's value
                   - iomesh-worker-1
    ```
    For more information about pod affinity configuration rule, see: [pod affinity](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#affinity-and-anti-affinity)

3. Install IOMesh Cluster:

    > **_NOTE_: replace `iomesh` with your release name.**

    ```shell
    helm install iomesh iomesh/iomesh \
        --create-namespace \
        --namespace iomesh-system \
        --values iomesh.yaml \
        --wait
    ```

    ```output
    NAME: iomesh
    LAST DEPLOYED: Wed Jun 30 16:00:32 2021
    NAMESPACE: iomesh-system
    STATUS: deployed
    REVISION: 1
    TEST SUITE: None
    ```

4. You can run `kubectl --namespace iomesh-system get pods` to check out the result:

    ```bash
    kubectl --namespace iomesh-system get pods
    ```

    ```output
    NAME                                                  READY   STATUS    RESTARTS   AGE
    csi-driver-controller-plugin-89b55d6b5-8r2fc          6/6     Running   10         2m8s
    csi-driver-controller-plugin-89b55d6b5-d4rbr          6/6     Running   10         2m8s
    csi-driver-controller-plugin-89b55d6b5-n5s48          6/6     Running   10         2m8s
    csi-driver-node-plugin-9wccv                          3/3     Running   2          2m8s
    csi-driver-node-plugin-mbpnk                          3/3     Running   2          2m8s
    csi-driver-node-plugin-x6qrk                          3/3     Running   2          2m8s
    iomesh-chunk-0                                        3/3     Running   0          52s
    iomesh-chunk-1                                        3/3     Running   0          47s
    iomesh-chunk-2                                        3/3     Running   0          43s
    iomesh-hostpath-provisioner-8fzvj                     1/1     Running   0          2m8s
    iomesh-hostpath-provisioner-gfl9k                     1/1     Running   0          2m8s
    iomesh-hostpath-provisioner-htzx9                     1/1     Running   0          2m8s
    iomesh-iscsi-redirector-96672                         2/2     Running   1          55s
    iomesh-iscsi-redirector-c2pwm                         2/2     Running   1          55s
    iomesh-iscsi-redirector-pcx8c                         2/2     Running   1          55s
    iomesh-meta-0                                         2/2     Running   0          55s
    iomesh-meta-1                                         2/2     Running   0          55s
    iomesh-meta-2                                         2/2     Running   0          55s
    iomesh-openebs-ndm-5457z                              1/1     Running   0          2m8s
    iomesh-openebs-ndm-599qb                              1/1     Running   0          2m8s
    iomesh-openebs-ndm-cluster-exporter-68c757948-gszzx   1/1     Running   0          2m8s
    iomesh-openebs-ndm-node-exporter-kzjfc                1/1     Running   0          2m8s
    iomesh-openebs-ndm-node-exporter-qc9pt                1/1     Running   0          2m8s
    iomesh-openebs-ndm-node-exporter-v7sh7                1/1     Running   0          2m8s
    iomesh-openebs-ndm-operator-56cfb5d7b6-srfzm          1/1     Running   0          2m8s
    iomesh-openebs-ndm-svp9n                              1/1     Running   0          2m8s
    iomesh-zookeeper-0                                    1/1     Running   0          2m3s
    iomesh-zookeeper-1                                    1/1     Running   0          102s
    iomesh-zookeeper-2                                    1/1     Running   0          76s
    iomesh-zookeeper-operator-7b5f4b98dc-6mztk            1/1     Running   0          2m8s
    operator-85877979-66888                               1/1     Running   0          2m8s
    operator-85877979-s94vz                               1/1     Running   0          2m8s
    operator-85877979-xqtml                               1/1     Running   0          2m8s
    ```

IOMesh Cluster is now installed successfully. Please go to [Setup IOMesh](setup-iomesh.md).

[1]: http://iomesh.com/charts
[2]: http://www.iomesh.com/docs/installation/setup-iomesh-storage#setup-data-network

## Install IOMesh on OpenShift Container Platform

For OpenShift cluster, you can also install and use IOMesh through the IOMesh Operator on the OperatorHub page of the Red Hat OpenShift Container Platform.

### Pre-Install

Run IOMesh Operator pre-installation script in an environment where oc or kubectl can be used to access the OpenShift cluster, the script will install the dependencies of IOMesh Operator and specific IOMesh settings for the OpenShift cluster:

```shell
curl -sSL https://iomesh.run/iomesh-operator-pre-install-openshift.sh | sh -
```

### Install IOMesh Operator

1. Log in to your OpenShift Container Platform and visit the OperatorHub page. Select IOMesh Operator and click Install to start the installation of IOMesh Operator.

2. On the Installed Operators > IOMesh Operator > Create instance > YAML view, fill in an IOMesh Custom Resources according to IOMesh [YAML](https://iomesh.run/iomesh.yaml), change the spec.*.dataCIDR to your own data network CIDR.

### Install CSI Driver

Run IOMesh Operator post-installation script in an environment where oc or kubectl can be used to access the OpenShift cluster, the script will install IOMesh CSI Driver:

```shell
curl -sSL https://iomesh.run/iomesh-operator-post-install-openshift.sh | sh -
```
    
IOMeshCluster is now installed successfully, please go to [Setup IOMesh](setup-iomesh.md).
